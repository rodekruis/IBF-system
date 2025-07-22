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
            
            if ($log) $log->info("[IBF-DASHBOARD] Dashboard configuration ready with URL: " . $dashboardUrl);

            return [
                'success' => true,
                'pageTitle' => 'IBF Dashboard',
                'dashboardUrl' => $dashboardUrl,
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
                if ($log) $log->warning("[IBF-DASHBOARD] IBFUser entity not yet created, skipping IBFUser lookup");
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
            
            if (!$autoCreateUsers || $requireUserMapping) {
                if ($log) $log->info("[IBF-DASHBOARD] IBFUser auto-creation disabled or mapping required");
                if ($requireUserMapping) {
                    throw new \Espo\Core\Exceptions\Forbidden('IBF user mapping required. Please contact your administrator to set up your IBF access.');
                }
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
        
        $createUserUrl = 'https://ibf-test.510.global/api/user';
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
        $ibfApiUrl = 'https://ibf-test.510.global/api/user/login';
        $loginData = [
            'email' => $email,
            'password' => $password
        ];

        if ($log) $log->debug("[IBF-DASHBOARD] Attempting IBF login for: " . $email);

        $curl = curl_init($ibfApiUrl);
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
     * Get admin credentials for IBF (same logic as ibfAuth.php)
     */
    private function getAdminUserCredentialsInIBF($log = null): ?string
    {
        try {
            if ($log) $log->debug("[IBF-DASHBOARD] Getting admin user credentials from IBF...");
            
            try {
                $secretProvider = $this->getInjectableFactory()->create('Espo\\Tools\\AppSecret\\SecretProvider');
            } catch (\Exception $e) {
                if ($log) $log->error("[IBF-DASHBOARD] Failed to get SecretProvider: " . $e->getMessage());
                return null;
            }

            $ibfUser = $secretProvider->get('ibfUser');
            $ibfPassword = $secretProvider->get('ibfToken');

            if (!$ibfUser || !$ibfPassword) {
                if ($log) $log->error("[IBF-DASHBOARD] IBF admin credentials not found in EspoCRM AppSecret");
                return null;
            }

            // Login to IBF API with admin credentials
            return $this->loginIbfUserAndGetToken($ibfUser, $ibfPassword, $log);

        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Exception in getAdminUserCredentialsInIBF: " . $e->getMessage());
            return null;
        }
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
            if ($log) $log->debug("[IBF-DASHBOARD] getActionGetSettings - User object: " . ($user ? "exists" : "null"));
            
            if (!$user) {
                if ($log) $log->error("[IBF-DASHBOARD] getActionGetSettings - User not authenticated");
                throw new Forbidden('User not authenticated');
            }
            
            if ($log) $log->debug("[IBF-DASHBOARD] getActionGetSettings - User: " . $user->get('userName') . ", isAdmin: " . ($user->isAdmin() ? 'true' : 'false'));
            
            if (!$user->isAdmin()) {
                if ($log) $log->error("[IBF-DASHBOARD] getActionGetSettings - User is not admin");
                throw new Forbidden('Admin access required for IBF settings');
            }
            
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] getActionGetSettings - Exception: " . $e->getMessage());
            throw $e;
        }
        
        $settings = [
            'ibfDashboardUrl' => $this->getConfig()->get('ibfDashboardUrl', 'https://ibf-pivot.510.global'),
            'ibfEnabledCountries' => $this->getConfig()->get('ibfEnabledCountries', ['ETH', 'UGA', 'ZMB', 'KEN']),
            'ibfDefaultCountry' => $this->getConfig()->get('ibfDefaultCountry', 'ETH'),
            'ibfDisasterTypes' => $this->getConfig()->get('ibfDisasterTypes', ['drought', 'floods', 'heavy-rainfall']),
            'ibfApiUrl' => $this->getConfig()->get('ibfApiUrl', 'https://ibf-pivot.510.global/api'),
            'ibfAutoCreateUsers' => $this->getConfig()->get('ibfAutoCreateUsers', true),
            'ibfRequireUserMapping' => $this->getConfig()->get('ibfRequireUserMapping', false)
        ];

        return (object) [
            'settings' => $settings,
            'availableCountries' => $this->getAvailableCountries(),
            'availableDisasterTypes' => $this->getAvailableDisasterTypes()
        ];
    }

    /**
     * Save settings action - only accessible to administrators  
     */
    public function postActionSaveSettings(Request $request): bool
    {
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
        
        // Validate and save each setting
        foreach ($settings as $key => $value) {
            switch ($key) {
                case 'ibfDashboardUrl':
                case 'ibfApiUrl':
                    if (!filter_var($value, FILTER_VALIDATE_URL)) {
                        throw new BadRequest("Invalid URL format for $key");
                    }
                    $this->getConfigWriter()->set($key, $value);
                    break;
                
                case 'ibfDefaultCountry':
                    if (!preg_match('/^[A-Z]{3}$/', $value)) {
                        throw new BadRequest('Invalid country code. Must be 3-letter ISO code.');
                    }
                    $this->getConfigWriter()->set($key, $value);
                    break;
                
                case 'ibfEnabledCountries':
                case 'ibfDisasterTypes':
                    if (is_array($value)) {
                        $this->getConfigWriter()->set($key, $value);
                    }
                    break;
                
                case 'ibfAutoCreateUsers':
                case 'ibfRequireUserMapping':
                    $this->getConfigWriter()->set($key, (bool) $value);
                    break;
            }
        }

        $this->getConfigWriter()->save();
        $this->getInjectableFactory()->create('Espo\\Core\\DataManager')->clearCache();

        return true;
    }

    private function getAvailableCountries(): array
    {
        return [
            'ETH' => 'Ethiopia',
            'UGA' => 'Uganda', 
            'ZMB' => 'Zambia',
            'KEN' => 'Kenya',
            'MWI' => 'Malawi',
            'SSD' => 'South Sudan',
            'PHL' => 'Philippines',
            'ZWE' => 'Zimbabwe',
            'LSO' => 'Lesotho'
        ];
    }

    private function getAvailableDisasterTypes(): array
    {
        return [
            'drought' => 'Drought',
            'floods' => 'Floods',
            'heavy-rainfall' => 'Heavy Rainfall', 
            'typhoon' => 'Typhoon',
            'malaria' => 'Malaria',
            'flash-floods' => 'Flash Floods'
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
}
