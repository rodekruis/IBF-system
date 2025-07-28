<?php

namespace Espo\Modules\IBFDashboard\Controllers;

use Espo\Core\Controllers\Base;
use Espo\Core\Api\Request;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Utils\Log;
use Espo\Core\InjectableFactory;
use Espo\Core\Utils\Config;
use Espo\Core\Utils\Config\ConfigWriter;
use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\BadRequest;

class IBFDashboard extends Base
{
    protected function getEntityManager(): EntityManager
    {
        return $this->getContainer()->getByClass(EntityManager::class);
    }

    protected function getInjectableFactory(): InjectableFactory
    {
        return $this->getContainer()->getByClass(InjectableFactory::class);
    }

    protected function getConfig(): Config
    {
        return $this->getContainer()->getByClass(Config::class);
    }

    protected function getConfigWriter(): ConfigWriter
    {
        return $this->getInjectableFactory()->create(ConfigWriter::class);
    }

    /**
     * Get the current EspoCRM instance base URL
     */
    private function getEspoCrmBaseUrl(): string
    {
        // Try to get configured site URL first
        $siteUrl = $this->getConfig()->get('siteUrl');
        
        if ($siteUrl) {
            return rtrim($siteUrl, '/');
        }
        
        // Fallback: detect from current request
        $request = $this->getContainer()->get('request');
        if ($request) {
            $scheme = $request->getScheme() ?: (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
            $host = $request->getHost() ?: $_SERVER['HTTP_HOST'] ?? 'localhost';
            return $scheme . '://' . $host;
        }
        
        // Final fallback: try to detect from $_SERVER
        $scheme = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $scheme . '://' . $host;
    }

    public function actionIndex(): array
    {
        $log = $GLOBALS['log'] ?? null;
        if ($log) {
            $log->info("[IBF-DASHBOARD] Index action called at " . date('Y-m-d H:i:s'));
        }

        try {
            // Get current user
            $user = $this->getUser();
            if (!$user) {
                if ($log) $log->error("[IBF-DASHBOARD] No authenticated user found");
                throw new \Espo\Core\Exceptions\Forbidden('User not authenticated');
            }

            if ($log) $log->info("[IBF-DASHBOARD] Authenticated user: " . $user->get('userName'));

            // Get user's auth token for client-side authentication
            $authToken = $this->getCurrentUserToken();
            if (!$authToken) {
                if ($log) $log->warning("[IBF-DASHBOARD] No auth token found for user");
            }

            // Get IBF API token using the same logic as ibfAuth.php
            $ibfToken = $this->getIbfApiToken($user, $log);
            if (!$ibfToken) {
                if ($log) $log->warning("[IBF-DASHBOARD] Could not retrieve IBF API token, will use client-side auth");
            }

            // Use configured dashboard URL instead of hardcoded value
            $dashboardUrl = $this->getConfig()->get('ibfDashboardUrl', 'https://ibf-pivot.510.global');
            $ibfBackendApiUrl = $this->getConfig()->get('ibfBackendApiUrl', 'https://ibf-test.510.global/api');
            $ibfGeoserverUrl = $this->getConfig()->get('ibfGeoserverUrl', 'https://ibf.510.global/geoserver/ibf-system/wms');
            
            if ($log) $log->info("[IBF-DASHBOARD] Dashboard configuration ready with URL: " . $dashboardUrl);

            return [
                'success' => true,
                'pageTitle' => 'IBF Dashboard',
                'dashboardUrl' => $dashboardUrl,
                'ibfBackendApiUrl' => $ibfBackendApiUrl,
                'ibfGeoserverUrl' => $ibfGeoserverUrl,
                'userId' => $user->getId(),
                'authToken' => $authToken,
                'ibfToken' => $ibfToken
            ];

        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Exception in actionIndex: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Admin action - renders the admin settings page
     */
    public function getActionAdmin(): array
    {
        // This action just indicates that the admin view should be rendered
        // The actual view will be handled by the client-side JavaScript
        return [
            'success' => true,
            'view' => 'admin'
        ];
    }

    /**
     * Get current user's authentication token via API
     */
    public function getActionGetUserToken(): array
    {
        $token = $this->getCurrentUserToken();
        
        if (!$token) {
            return [
                'success' => false,
                'error' => 'No active authentication token found'
            ];
        }
        
        return [
            'success' => true,
            'token' => $token
        ];
    }

    /**
     * Get current user's authentication token
     */
    private function getCurrentUserToken(): ?string
    {
        $user = $this->getUser();
        if (!$user) {
            return null;
        }

        // Try to find an active auth token for the current user
        $authToken = $this->getEntityManager()
            ->getRDBRepository('AuthToken')
            ->where([
                'userId' => $user->getId(),
                'isActive' => true
            ])
            ->order('lastAccess', 'DESC')
            ->findOne();

        return $authToken ? $authToken->get('token') : null;
    }

    /**
     * Get IBF API token using the IBFUser entity
     */
    private function getIbfApiToken($user, $log = null): ?string
    {
        try {
            if ($log) $log->debug("[IBF-DASHBOARD] Checking IBF access and user record...");
            
            // Check if user has IBF access through team membership
            $this->checkIBFAccess();
            
            // Get IBFUser record (should exist due to team hooks)
            $ibfUser = $this->getOrCreateIBFUser($user, $log);
            if (!$ibfUser) {
                if ($log) $log->error("[IBF-DASHBOARD] No IBFUser record found");
                return null;
            }

            $ibfEmail = $ibfUser->get('email');
            $ibfPassword = $ibfUser->get('password');

            if ($log) $log->info("[IBF-DASHBOARD] IBF credentials check - Email: " . ($ibfEmail ? 'exists' : 'missing') . ", Password: " . ($ibfPassword ? 'exists' : 'missing'));
            
            if (!$ibfEmail || !$ibfPassword) {
                if ($log) $log->error("[IBF-DASHBOARD] IBFUser exists but missing credentials");
                return null;
            }
            
            if ($log) $log->info("[IBF-DASHBOARD] Found IBFUser credentials, attempting login...");
            $token = $this->loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log);
            
            if ($token) {
                // Update last login time and token
                $ibfUser->set('lastIbfLogin', date('Y-m-d H:i:s'));
                $ibfUser->set('ibfToken', $token);
                $this->getEntityManager()->saveEntity($ibfUser);
            }
            
            return $token;
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Exception in getIbfApiToken: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create IBFUser record based on settings
     */
    private function getOrCreateIBFUser($user, $log = null): ?object
    {
        try {
            // Check if IBFUser repository exists (entity may not be created yet)
            if (!$this->getEntityManager()->hasRepository('IBFUser')) {
                if ($log) $log->error("[IBF-DASHBOARD] IBFUser entity not yet created, skipping IBFUser lookup - this is likely the main issue");
                return null;
            }

            // Check if IBFUser exists
            $ibfUser = $this->getEntityManager()
                ->getRDBRepository('IBFUser')
                ->where(['userId' => $user->getId()])
                ->findOne();
            
            if ($ibfUser) {
                if ($log) $log->debug("[IBF-DASHBOARD] Found existing IBFUser record");
                return $ibfUser;
            }
            
            // Check auto-creation setting
            $autoCreateUsers = $this->getConfig()->get('ibfAutoCreateUsers', true);
            $requireUserMapping = $this->getConfig()->get('ibfRequireUserMapping', false);
            
            if ($log) $log->info("[IBF-DASHBOARD] Auto-creation settings: ibfAutoCreateUsers={$autoCreateUsers}, ibfRequireUserMapping={$requireUserMapping}");
            
            if (!$autoCreateUsers || $requireUserMapping) {
                if ($log) $log->warning("[IBF-DASHBOARD] IBFUser auto-creation disabled or mapping required");
                if ($requireUserMapping) {
                    throw new \Espo\Core\Exceptions\Forbidden('IBF user mapping required. Please contact your administrator to set up your IBF access.');
                }
                return null;
            }
            
            // Check if admin credentials are available before attempting creation
            $adminToken = $this->getAdminUserCredentialsInIBF($log);
            if (!$adminToken) {
                if ($log) $log->error("[IBF-DASHBOARD] Cannot create IBF user - admin token not available. Check ibfAdminUserId configuration and admin IBFUser credentials.");
                return null;
            }
            
            // Auto-create IBFUser
            if ($log) $log->info("[IBF-DASHBOARD] Auto-creating IBFUser record...");
            return $this->createIBFUserRecord($user, $log);

        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Error in getOrCreateIBFUser: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create IBFUser record and get IBF API token
     */
    private function createIBFUserRecord($user, $log = null): ?object
    {
        // Get admin credentials for user creation
        $adminToken = $this->getAdminUserCredentialsInIBF($log);
        if (!$adminToken) {
            if ($log) $log->error("[IBF-DASHBOARD] Cannot create IBF user - admin token not available");
            return null;
        }

        // Create user in IBF system
        $espoEmail = $user->get('emailAddress');
        $espoFirstName = $user->get('firstName');
        $espoLastName = $user->get('lastName');
        
        if (!$espoEmail) {
            if ($log) $log->error("[IBF-DASHBOARD] Cannot create IBF user - no email address");
            return null;
        }

        $generatedPassword = bin2hex(random_bytes(8));
        
        // Use configurable IBF backend API URL for user operations
        $ibfBackendApiUrl = $this->getConfig()->get('ibfBackendApiUrl', 'https://ibf-test.510.global/api');
        $createUserUrl = $ibfBackendApiUrl . '/user';
        $userData = [
            'email' => $espoEmail,
            'password' => $generatedPassword,
            'firstName' => $espoFirstName ?: 'User',
            'lastName' => $espoLastName ?: 'EspoCRM',
        ];

        if ($log) $log->debug("[IBF-DASHBOARD] Creating IBF system user with email: " . $espoEmail);

        $curl = curl_init($createUserUrl);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $adminToken
        ]);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($userData));
        curl_setopt($curl, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode === 201 || $httpCode === 200) {
            if ($log) $log->info("[IBF-DASHBOARD] IBF system user created successfully");
            
            // Create IBFUser record in EspoCRM
            $ibfUser = $this->getEntityManager()->getNewEntity('IBFUser');
            $ibfUser->set('userId', $user->getId());
            $ibfUser->set('email', $espoEmail);
            $ibfUser->set('password', $generatedPassword); // Consider encrypting this
            $ibfUser->set('allowedCountries', $this->getConfig()->get('ibfEnabledCountries', ['ETH', 'UGA', 'ZMB', 'KEN']));
            $ibfUser->set('allowedDisasterTypes', $this->getConfig()->get('ibfDisasterTypes', ['drought', 'floods', 'heavy-rainfall']));
            $ibfUser->set('isActive', true);
            $ibfUser->set('autoCreated', true);
            
            try {
                $this->getEntityManager()->saveEntity($ibfUser);
                if ($log) $log->info("[IBF-DASHBOARD] IBFUser record created successfully");
                return $ibfUser;
            } catch (\Exception $e) {
                if ($log) $log->error("[IBF-DASHBOARD] Failed to create IBFUser record: " . $e->getMessage());
                return null;
            }
        } else {
            if ($log) $log->error("[IBF-DASHBOARD] Failed to create IBF system user. HTTP Code: " . $httpCode . ", Response: " . $response);
            return null;
        }
    }

    /**
     * Login IBF user and get token (same logic as ibfAuth.php)
     */
    private function loginIbfUserAndGetToken($email, $password, $log = null): ?string
    {
        // Use configurable IBF backend API URL for authentication
        $ibfBackendApiUrl = $this->getConfig()->get('ibfBackendApiUrl', 'https://ibf-test.510.global/api');
        $loginUrl = $ibfBackendApiUrl . '/user/login';
        $loginData = [
            'email' => $email,
            'password' => $password
        ];

        if ($log) $log->debug("[IBF-DASHBOARD] Attempting IBF login for: " . $email);

        $curl = curl_init($loginUrl);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($loginData));
        curl_setopt($curl, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode === 200) {
            $responseData = json_decode($response, true);
            if (isset($responseData['user']['token'])) {
                if ($log) $log->info("[IBF-DASHBOARD] IBF login successful");
                return $responseData['user']['token'];
            }
        }

        if ($log) $log->warning("[IBF-DASHBOARD] IBF login failed. HTTP Code: " . $httpCode);
        return null;
    }

    /**
     * Get admin credentials for IBF using the configured admin user
     */
    private function getAdminUserCredentialsInIBF($log = null): ?string
    {
        try {
            if ($log) $log->debug("[IBF-DASHBOARD] Getting IBF admin credentials...");
            
            // Get configured admin user ID
            $adminUserId = $this->getConfig()->get('ibfAdminUserId');
            if (!$adminUserId) {
                if ($log) $log->error("[IBF-DASHBOARD] No ibfAdminUserId configured - this is required for IBF user auto-creation");
                return null;
            }
            
            if ($log) $log->debug("[IBF-DASHBOARD] Using configured admin user ID: {$adminUserId}");
            
            // Get the admin user
            $adminUser = $this->getEntityManager()->getEntity('User', $adminUserId);
            if (!$adminUser) {
                if ($log) $log->error("[IBF-DASHBOARD] Configured admin user ID {$adminUserId} not found");
                return null;
            }
            
            if ($log) $log->debug("[IBF-DASHBOARD] Found admin user: " . $adminUser->get('userName'));
            
            // Check if IBFUser repository exists
            if (!$this->getEntityManager()->hasRepository('IBFUser')) {
                if ($log) $log->error("[IBF-DASHBOARD] IBFUser entity not available - cannot check admin IBFUser credentials");
                return null;
            }
            
            // Get IBFUser record for the admin
            $adminIBFUser = $this->getEntityManager()
                ->getRDBRepository('IBFUser')
                ->where(['userId' => $adminUserId])
                ->findOne();
                
            if (!$adminIBFUser) {
                if ($log) $log->error("[IBF-DASHBOARD] No IBFUser record found for configured admin user {$adminUserId}. Admin must have an IBFUser record with valid IBF credentials.");
                return null;
            }
            
            $ibfEmail = $adminIBFUser->get('email');
            $ibfPassword = $adminIBFUser->get('password');
            $isActive = $adminIBFUser->get('isActive');
            
            if ($log) $log->debug("[IBF-DASHBOARD] Admin IBFUser check - Email: " . ($ibfEmail ? 'exists' : 'missing') . ", Password: " . ($ibfPassword ? 'exists' : 'missing') . ", Active: " . ($isActive ? 'true' : 'false'));
            
            if (!$ibfEmail || !$ibfPassword || !$isActive) {
                if ($log) $log->error("[IBF-DASHBOARD] Admin IBFUser exists but missing credentials or inactive - email:" . ($ibfEmail ? 'OK' : 'MISSING') . ", password:" . ($ibfPassword ? 'OK' : 'MISSING') . ", active:" . ($isActive ? 'OK' : 'INACTIVE'));
                return null;
            }
            
            // Try to login with admin IBFUser credentials
            $token = $this->loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log);
            if ($token) {
                if ($log) $log->info("[IBF-DASHBOARD] Successfully obtained admin token for IBF user creation");
                return $token;
            } else {
                if ($log) $log->error("[IBF-DASHBOARD] Failed to login with admin IBFUser credentials - check if the credentials are valid in the IBF system");
                return null;
            }

        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Exception getting admin credentials: " . $e->getMessage());
        }
        
        return null;
    }

    /**
     * Admin action - only accessible to administrators
     */
    public function actionAdmin(): array
    {
        // Check if user is authenticated and is admin
        $user = $this->getUser();
        if (!$user) {
            throw new Forbidden('User not authenticated');
        }
        
        if (!$user->isAdmin()) {
            throw new Forbidden('Admin access required for IBF Dashboard administration');
        }
        
        return [];
    }

    /**
     * Get settings action - only accessible to administrators
     */
    public function getActionGetSettings(Request $request): object
    {
        $log = $GLOBALS['log'] ?? null;
        
        try {
            // Check if user is authenticated and is admin
            $user = $this->getUser();
            if (!$user) {
                throw new Forbidden('User not authenticated');
            }
            
            if (!$user->isAdmin()) {
                throw new Forbidden('Admin access required for IBF settings');
            }
            
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Access denied: " . $e->getMessage());
            throw $e;
        }
        
        // Auto-detect EspoCRM API URL from current instance
        $ibfApiUrl = $this->getEspoCrmBaseUrl() . '/api';

        $settings = [
            'ibfDashboardUrl' => $this->getConfig()->get('ibfDashboardUrl', 'https://ibf-pivot.510.global'),
            'ibfEnabledCountries' => $this->getConfig()->get('ibfEnabledCountries', ['ETH', 'UGA', 'ZMB', 'KEN']),
            'ibfDefaultCountry' => $this->getConfig()->get('ibfDefaultCountry', 'ETH'),
            'ibfDisasterTypes' => $this->getConfig()->get('ibfDisasterTypes', ['drought', 'floods', 'heavy-rainfall']),
            'ibfApiUrl' => $ibfApiUrl, // Auto-detected from EspoCRM instance
            'ibfBackendApiUrl' => $this->getConfig()->get('ibfBackendApiUrl', 'https://ibf-test.510.global/api'),
            'ibfGeoserverUrl' => $this->getConfig()->get('ibfGeoserverUrl', 'https://ibf.510.global/geoserver/ibf-system/wms'),
            'ibfAutoCreateUsers' => $this->getConfig()->get('ibfAutoCreateUsers', true),
            'ibfRequireUserMapping' => $this->getConfig()->get('ibfRequireUserMapping', false),
            'ibfAdminUserId' => $this->getConfig()->get('ibfAdminUserId', null)
        ];
        
        if ($log) $log->info("[IBF-DASHBOARD] Loading IBF settings for admin");

        // Get IBF user info if admin user is set
        $ibfUserInfo = null;
        if (!empty($settings['ibfAdminUserId'])) {
            $ibfUserInfo = $this->getIBFUserInfo($settings['ibfAdminUserId'], $log);
        }

        return (object) [
            'settings' => $settings,
            'availableCountries' => $this->getAvailableCountries(),
            'availableDisasterTypes' => $this->getAvailableDisasterTypes(),
            'availableUsers' => $this->getAvailableUsers(),
            'ibfUserInfo' => $ibfUserInfo
        ];
    }

    /**
     * Save settings action - only accessible to administrators  
     */
    public function postActionSaveSettings(Request $request): bool
    {
        $log = $GLOBALS['log'] ?? null;
        
        // Check if user is authenticated and is admin
        $user = $this->getUser();
        if (!$user) {
            throw new Forbidden('User not authenticated');
        }
        
        if (!$user->isAdmin()) {
            throw new Forbidden('Admin access required for IBF settings');
        }
        
        $data = $request->getParsedBody();
        
        if (empty($data->settings)) {
            throw new BadRequest('No settings data provided');
        }

        $settings = (array) $data->settings;
        
        if ($log) $log->info("[IBF-DASHBOARD] Saving IBF settings");
        
        // Create ConfigWriter instance ONCE and reuse it (following EspoCRM documentation pattern)
        $configWriter = $this->getInjectableFactory()->create(ConfigWriter::class);
        
        // Validate and save each setting
        foreach ($settings as $key => $value) {
            switch ($key) {
                case 'ibfDashboardUrl':
                case 'ibfBackendApiUrl':
                case 'ibfGeoserverUrl':
                    if (!filter_var($value, FILTER_VALIDATE_URL)) {
                        throw new BadRequest("Invalid URL format for $key");
                    }
                    $configWriter->set($key, $value);
                    break;
                
                case 'ibfApiUrl':
                    // IBF API URL is auto-detected from EspoCRM instance, skip saving
                    break;
                
                case 'ibfDefaultCountry':
                    if (!preg_match('/^[A-Z]{3}$/', $value)) {
                        throw new BadRequest('Invalid country code. Must be 3-letter ISO code.');
                    }
                    $configWriter->set($key, $value);
                    break;
                
                case 'ibfEnabledCountries':
                case 'ibfDisasterTypes':
                    if (is_array($value)) {
                        $configWriter->set($key, $value);
                    }
                    break;
                
                case 'ibfAutoCreateUsers':
                case 'ibfRequireUserMapping':
                    $configWriter->set($key, (bool) $value);
                    break;
                
                case 'ibfAdminUserId':
                    // Validate that the user exists and auto-create IBFUser if needed
                    if ($value) {
                        $adminUser = $this->getEntityManager()->getEntity('User', $value);
                        if (!$adminUser) {
                            throw new BadRequest('Selected IBF admin user does not exist');
                        }
                        if (!$adminUser->get('isActive')) {
                            throw new BadRequest('Selected IBF admin user is not active');
                        }
                        
                        // Ensure IBFUser exists for the admin
                        $this->ensureAdminIBFUser($adminUser, $log);
                        
                        $configWriter->set($key, $value);
                    } else {
                        $configWriter->set($key, null);
                    }
                    break;
            }
        }

        try {
            $configWriter->save();
            if ($log) $log->info("[IBF-DASHBOARD] IBF settings saved successfully");
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Failed to save settings: " . $e->getMessage());
            throw new BadRequest("Failed to save configuration: " . $e->getMessage());
        }
        
        try {
            $this->getInjectableFactory()->create('Espo\\Core\\DataManager')->clearCache();
        } catch (\Exception $e) {
            if ($log) $log->warning("[IBF-DASHBOARD] Cache clear failed: " . $e->getMessage());
        }
        
        return true;
    }

    /**
     * Ensure the admin user has an IBFUser record with IBF credentials
     * Note: The IBF admin user must be manually created in the IBF system first by a super admin
     */
    private function ensureAdminIBFUser($adminUser, $log = null): void
    {
        try {
            // Check if IBFUser repository exists
            if (!$this->getEntityManager()->hasRepository('IBFUser')) {
                if ($log) $log->warning("[IBF-DASHBOARD] IBFUser entity not available for admin user setup");
                return;
            }
            
            // Check if IBFUser already exists
            $existingIBFUser = $this->getEntityManager()
                ->getRDBRepository('IBFUser')
                ->where(['userId' => $adminUser->getId()])
                ->findOne();
                
            if ($existingIBFUser) {
                if ($log) $log->debug("[IBF-DASHBOARD] IBFUser already exists for admin user");
                return;
            }
            
            // Create IBFUser record for admin - credentials must be filled manually
            $adminEmail = $adminUser->get('emailAddress');
            if (!$adminEmail) {
                if ($log) $log->error("[IBF-DASHBOARD] Admin user has no email address, cannot create IBFUser");
                return;
            }
            
            // Create IBFUser record in EspoCRM with placeholder values
            // Admin must manually set the actual IBF email and password
            $ibfUser = $this->getEntityManager()->getNewEntity('IBFUser');
            $ibfUser->set('userId', $adminUser->getId());
            $ibfUser->set('email', $adminEmail); // Default to EspoCRM email, but admin can change this
            $ibfUser->set('password', ''); // Empty - admin must fill with actual IBF password
            $ibfUser->set('allowedCountries', $this->getConfig()->get('ibfEnabledCountries', ['ETH', 'UGA', 'ZMB', 'KEN']));
            $ibfUser->set('allowedDisasterTypes', $this->getConfig()->get('ibfDisasterTypes', ['drought', 'floods', 'heavy-rainfall']));
            $ibfUser->set('isActive', false); // Inactive until credentials are properly set
            $ibfUser->set('autoCreated', true);
            $ibfUser->set('isAdmin', true); // Mark as admin IBF user
            
            $this->getEntityManager()->saveEntity($ibfUser);
            
            if ($log) $log->info("[IBF-DASHBOARD] Created IBFUser record for admin user: " . $adminUser->get('userName') . " - IBF credentials must be set manually");
            
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Failed to create IBFUser for admin: " . $e->getMessage());
        }
    }

    private function getAvailableCountries(): array
    {
        return [
            ['code' => 'ETH', 'name' => 'Ethiopia'],
            ['code' => 'UGA', 'name' => 'Uganda'],
            ['code' => 'ZMB', 'name' => 'Zambia'],
            ['code' => 'KEN', 'name' => 'Kenya'],
            ['code' => 'MWI', 'name' => 'Malawi'],
            ['code' => 'SSD', 'name' => 'South Sudan'],
            ['code' => 'PHL', 'name' => 'Philippines'],
            ['code' => 'ZWE', 'name' => 'Zimbabwe'],
            ['code' => 'LSO', 'name' => 'Lesotho']
        ];
    }

    private function getAvailableDisasterTypes(): array
    {
        return [
            ['code' => 'drought', 'name' => 'Drought'],
            ['code' => 'floods', 'name' => 'Floods'],
            ['code' => 'heavy-rainfall', 'name' => 'Heavy Rainfall'],
            ['code' => 'typhoon', 'name' => 'Typhoon'],
            ['code' => 'malaria', 'name' => 'Malaria'],
            ['code' => 'flash-floods', 'name' => 'Flash Floods']
        ];
    }

    /**
     * Check if user has IBF access through team membership
     */
    private function checkIBFAccess()
    {
        try {
            $user = $this->getUser();
            
            // Check if user is in Anticipatory Action team
            $teamUser = $this->getEntityManager()->getRepository('TeamUser')
                ->join('team')
                ->where([
                    'userId' => $user->getId(),
                    'team.name' => 'Anticipatory Action'
                ])
                ->findOne();
                
            if (!$teamUser) {
                // For now, allow access if team doesn't exist yet (backward compatibility)
                // In production, you might want to be more strict
                $log = $GLOBALS['log'] ?? null;
                if ($log) $log->warning("[IBF-DASHBOARD] User not in Anticipatory Action team, but allowing access for backward compatibility");
                return true;
            }
            
            return true;

        } catch (\Exception $e) {
            // If there's an error checking team membership, allow access for backward compatibility
            $log = $GLOBALS['log'] ?? null;
            if ($log) $log->warning("[IBF-DASHBOARD] Error checking team access: " . $e->getMessage() . " - allowing access for backward compatibility");
            return true;
        }
    }

    private function getAvailableUsers(): array
    {
        $log = $GLOBALS['log'] ?? null;
        $availableUsers = [];
        
        try {
            $users = $this->getEntityManager()
                ->getRDBRepository('User')
                ->where(['isActive' => true])
                ->order('userName', 'ASC')
                ->find();
            
            foreach ($users as $user) {
                // Construct display name: prefer full name (firstName + lastName) over userName
                $firstName = $user->get('firstName');
                $lastName = $user->get('lastName');
                $displayName = $user->get('userName'); // fallback to userName
                
                if ($firstName || $lastName) {
                    $displayName = trim(($firstName ?: '') . ' ' . ($lastName ?: ''));
                }
                
                $availableUsers[] = [
                    'id' => $user->getId(),
                    'name' => $displayName,
                    'userName' => $user->get('userName'),
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'emailAddress' => $user->get('emailAddress')
                ];
            }
        } catch (\Exception $e) {
            if ($log) $log->warning("[IBF-DASHBOARD] Could not load users for admin selection: " . $e->getMessage());
        }
        
        return $availableUsers;
    }

    /**
     * Get IBF user information for a given user ID
     */
    private function getIBFUserInfo(string $userId, $log = null): array
    {
        $ibfUserInfo = [
            'exists' => false,
            'hasPassword' => false,
            'id' => null,
            'email' => null,
            'isActive' => false
        ];
        
        try {
            if (!$this->getEntityManager()->hasRepository('IBFUser')) {
                if ($log) $log->warning("[IBF-DASHBOARD] IBFUser entity not available");
                return $ibfUserInfo;
            }
            
            $ibfUser = $this->getEntityManager()
                ->getRDBRepository('IBFUser')
                ->where(['userId' => $userId])
                ->findOne();
            
            if ($ibfUser) {
                $ibfUserInfo['exists'] = true;
                $ibfUserInfo['id'] = $ibfUser->getId();
                $ibfUserInfo['email'] = $ibfUser->get('email');
                $ibfUserInfo['isActive'] = $ibfUser->get('isActive') ?: false;
                
                // Check if password is set (not empty)
                $password = $ibfUser->get('password');
                $ibfUserInfo['hasPassword'] = !empty($password);
                
                if ($log) $log->debug("[IBF-DASHBOARD] IBFUser found for user {$userId}: ID={$ibfUser->getId()}, hasPassword=" . ($ibfUserInfo['hasPassword'] ? 'true' : 'false'));
            } else {
                if ($log) $log->debug("[IBF-DASHBOARD] No IBFUser found for user {$userId}");
            }
            
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Error getting IBF user info: " . $e->getMessage());
        }
        
        return $ibfUserInfo;
    }
}
