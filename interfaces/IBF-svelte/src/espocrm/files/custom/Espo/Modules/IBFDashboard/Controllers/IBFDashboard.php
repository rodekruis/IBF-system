<?php

namespace Espo\Modules\IBFDashboard\Controllers;

use Espo\Core\Controllers\Base;
use Espo\Core\Api\Request;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Utils\Log;
use Espo\Core\InjectableFactory;

class IBFDashboard extends Base
{
    private EntityManager $entityManager;
    private InjectableFactory $injectableFactory;

    public function __construct(EntityManager $entityManager, InjectableFactory $injectableFactory)
    {
        $this->entityManager = $entityManager;
        $this->injectableFactory = $injectableFactory;
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

            $dashboardUrl = 'https://ibf-pivot.510.global';
            
            if ($log) $log->info("[IBF-DASHBOARD] Dashboard configuration ready");

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
        $authToken = $this->entityManager
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
     * Get IBF API token using the same logic as ibfAuth.php
     */
    private function getIbfApiToken($user, $log = null): ?string
    {
        try {
            if ($log) $log->debug("[IBF-DASHBOARD] Checking for existing IBF credentials...");
            $ibfEmail = $user->get('cIbfEmail');
            $ibfPassword = $user->get('cIBFpassword');

            if ($log) $log->info("[IBF-DASHBOARD] IBF credentials check - Email: " . ($ibfEmail ? 'exists' : 'missing') . ", Password: " . ($ibfPassword ? 'exists' : 'missing'));
            
            if (!$ibfEmail || !$ibfPassword) {
                if ($log) $log->info("[IBF-DASHBOARD] No existing IBF credentials found, creating new IBF user...");
                return $this->createIbfUserAndGetToken($user, $log);
            }
            
            if ($log) $log->info("[IBF-DASHBOARD] Found existing IBF credentials, attempting login...");
            return $this->loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log);
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-DASHBOARD] Exception in getIbfApiToken: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create IBF user and get token (same logic as ibfAuth.php)
     */
    private function createIbfUserAndGetToken($user, $log = null): ?string
    {
        // Get admin credentials for user creation
        $adminToken = $this->getAdminUserCredentialsInIBF($log);
        if (!$adminToken) {
            if ($log) $log->error("[IBF-DASHBOARD] Cannot create IBF user - admin token not available");
            return null;
        }

        // Create user in IBF
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

        if ($log) $log->debug("[IBF-DASHBOARD] Creating IBF user with email: " . $espoEmail);

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
            if ($log) $log->info("[IBF-DASHBOARD] IBF user created successfully");
            
            // Save credentials to EspoCRM user
            $user->set('cIbfEmail', $espoEmail);
            $user->set('cIBFpassword', $generatedPassword);
            $this->entityManager->saveEntity($user);
            
            // Now login to get token
            return $this->loginIbfUserAndGetToken($espoEmail, $generatedPassword, $log);
        } else {
            if ($log) $log->error("[IBF-DASHBOARD] Failed to create IBF user. HTTP Code: " . $httpCode . ", Response: " . $response);
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
                $secretProvider = $this->injectableFactory->create('Espo\\Tools\\AppSecret\\SecretProvider');
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
}
