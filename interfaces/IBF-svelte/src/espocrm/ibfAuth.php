<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Controllers\Base;
use Espo\Core\Api\Request;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Utils\Log;
use Espo\Core\InjectableFactory;

class IbfAuth extends Base
{
    private EntityManager $entityManager;
    private InjectableFactory $injectableFactory;

    public function __construct(EntityManager $entityManager, InjectableFactory $injectableFactory)
    {
        $this->entityManager = $entityManager;
        $this->injectableFactory = $injectableFactory;
    }

    public function actionTest(): array
    {
        // Set CORS headers to allow cross-origin requests
        $this->setCorsHeaders();
        
        $log = $GLOBALS['log'] ?? null;
        if ($log) {
            $log->info("[IBF-AUTH] Test endpoint called at " . date('Y-m-d H:i:s'));
        }
        return ['status' => 'Route working', 'timestamp' => date('Y-m-d H:i:s')];
    }

    public function actionValidateToken(Request $request): array
    {
        // Set CORS headers to allow cross-origin requests
        $this->setCorsHeaders();
        
        // Handle preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            return ['status' => 'ok'];
        }
        
        $log = $GLOBALS['log'] ?? null;
        if ($log) {
            $log->info("[IBF-AUTH] === Starting token validation process ===");
            $log->debug("[IBF-AUTH] Request method: " . $request->getMethod());
        }
        try {
            // Handle both GET and POST safely
            if ($request->getMethod() === 'POST') {
                if ($log) $log->debug("[IBF-AUTH] Processing POST request");
                $rawData = $request->getParsedBody();
                $token = $rawData->token ?? null;
                $userId = $rawData->userId ?? null;
            } else {
                if ($log) $log->debug("[IBF-AUTH] Processing GET request");
                $token = $request->getQueryParam('token');
                $userId = $request->getQueryParam('userId');
            }
            
            if ($log) $log->debug("[IBF-AUTH] Received parameters - Token: " . ($token ? substr($token, 0, 10) . '...' : 'null') . ", UserId: " . ($userId ?? 'null'));
            
            if (!$token || !$userId) {
                if ($log) $log->warning("[IBF-AUTH] Missing required parameters - token: " . ($token ? 'provided' : 'missing') . ", userId: " . ($userId ? 'provided' : 'missing'));
                return [
                    'valid' => false,
                    'error' => 'Token and userId are required'
                ];
            }
            
            if ($log) $log->debug("[IBF-AUTH] Validating EspoCRM token in database...");
            $authToken = $this->entityManager
                ->getRDBRepository('AuthToken')
                ->where([
                    'token' => $token,
                    'userId' => $userId,
                    'isActive' => true
                ])
                ->findOne();
                
            if (!$authToken) {
                if ($log) $log->warning("[IBF-AUTH] EspoCRM token validation failed - token not found, inactive, or doesn't belong to user");
                return [
                    'valid' => false,
                    'error' => 'Invalid token or token does not belong to specified user'
                ];
            }
            
            if ($log) $log->info("[IBF-AUTH] EspoCRM token validation successful");
            if ($log) $log->debug("[IBF-AUTH] Fetching user record for userId: " . $userId);
            
            $user = $this->entityManager->getEntity('User', $userId);
            if (!$user) {
                if ($log) $log->error("[IBF-AUTH] User not found in database for userId: " . $userId);
                return [
                    'valid' => false,
                    'error' => 'User not found'
                ];
            }
            
            if ($log) $log->info("[IBF-AUTH] User found: " . $user->get('emailAddress') . " (" . $user->get('userName') . ")");
            if ($log) $log->debug("[IBF-AUTH] Attempting to get IBF API token...");
            
            $ibfToken = $this->getIbfApiToken($user, $log);
            if (!$ibfToken) {
                if ($log) $log->error("[IBF-AUTH] Failed to retrieve IBF API token");
                return [
                    'valid' => false,
                    'error' => 'Failed to retrieve IBF API token'
                ];
            }
            
            if ($log) $log->info("[IBF-AUTH] IBF API token retrieved successfully");
            if ($log) $log->info("[IBF-AUTH] === Token validation process completed successfully ===");
            
            return [
                'valid' => true,
                'ibfToken' => $ibfToken
            ];
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in actionValidateToken: " . $e->getMessage());
            if ($log) $log->error("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            return [
                'valid' => false,
                'error' => 'Validation failed: ' . $e->getMessage()
            ];
        }
    }

    private function getIbfApiToken($user, $log = null): ?string
    {
        try {
            if ($log) $log->debug("[IBF-AUTH] Checking for existing IBF credentials...");
            $ibfEmail = $user->get('cIbfEmail');
            $ibfPassword = $user->get('cIBFpassword');

            if ($log) $log->info("[IBF-AUTH] IBF credentials check - Email: " . ($ibfEmail ? 'exists' : 'missing') . ", Password: " . ($ibfPassword ? 'exists' : 'missing'));
            
            if (!$ibfEmail || !$ibfPassword) {
                if ($log) $log->info("[IBF-AUTH] No existing IBF credentials found, creating new IBF user...");
                return $this->createIbfUserAndGetToken($user, $log);
            }
            
            if ($log) $log->info("[IBF-AUTH] Found existing IBF credentials, attempting login...");
            return $this->loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log);
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in getIbfApiToken: " . $e->getMessage());
            return null;
        }
    }

    private function getAdminUserCredentialsInIBF($log = null): ?string
    {
        try {
            if ($log) $log->debug("[IBF-AUTH] Getting admin user credentials from IBF...");
            
            // Use the SecretProvider service to get decrypted values
            try {
                $secretProvider = $this->injectableFactory->create('Espo\\Tools\\AppSecret\\SecretProvider');
            } catch (\Exception $e) {
                if ($log) $log->error("[IBF-AUTH] Failed to get SecretProvider: " . $e->getMessage());
                return null;
            }

            $ibfUser = $secretProvider->get('ibfUser');
            $ibfPassword = $secretProvider->get('ibfToken');

            if (!$ibfUser || !$ibfPassword) {
                if ($log) {
                    $log->error("[IBF-AUTH] IBF admin credentials not found in EspoCRM AppSecret");
                    if (!$ibfUser) $log->error("[IBF-AUTH] Missing secret: 'ibfUser'");
                    if (!$ibfPassword) $log->error("[IBF-AUTH] Missing secret: 'ibfToken'");
                }
                return null;
            }

            if ($log) $log->debug("[IBF-AUTH] Retrieved admin credentials, attempting login...");
            if ($log) $log->debug("[IBF-AUTH] Admin email: " . $ibfUser);

            // Login to IBF API
            $ibfApiUrl = 'https://ibf-test.510.global/api/user/login';
            $loginData = [
                'email' => $ibfUser,
                'password' => $ibfPassword
            ];
            $postData = json_encode($loginData);
            
            if ($log) $log->debug("[IBF-AUTH] Sending login request to: " . $ibfApiUrl);
            if ($log) $log->debug("[IBF-AUTH] Login payload: " . json_encode(['email' => $ibfUser, 'password' => '[REDACTED]']));
            
            $curl = curl_init($ibfApiUrl);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($postData)
            ]);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($curl, CURLOPT_TIMEOUT, 30);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $curlError = curl_error($curl);
            curl_close($curl);

            if ($log) $log->debug("[IBF-AUTH] Admin login response - HTTP Code: " . $httpCode);
            if ($curlError && $log) {
                $log->error("[IBF-AUTH] CURL Error during admin login: " . $curlError);
            }
            if ($response && $log) {
                $log->debug("[IBF-AUTH] Admin login response body: " . $response);
            }

            if (($httpCode !== 200 && $httpCode !== 201) || !$response) {
                if ($log) {
                    $log->error("[IBF-AUTH] Failed to get admin credentials from IBF API - HTTP Code: " . $httpCode);
                    if ($response) {
                        $log->error("[IBF-AUTH] Error response body: " . $response);
                        // Try to parse error response for more details
                        $errorData = json_decode($response, true);
                        if ($errorData && isset($errorData['message'])) {
                            $log->error("[IBF-AUTH] IBF API Error: " . $errorData['message']);
                        }
                    } else {
                        $log->error("[IBF-AUTH] No response body received");
                    }
                    if ($curlError) {
                        $log->error("[IBF-AUTH] cURL Error: " . $curlError);
                    }
                }
                return null;
            }

            $responseData = json_decode($response, true);
            $ibfToken = $responseData['user']['token'] ?? null;

            if (!$ibfToken) {
                if ($log) $log->error("[IBF-AUTH] No token received from IBF API admin login");
                return null;
            }

            if ($log) $log->debug("[IBF-AUTH] Successfully retrieved IBF token for admin user: " . $ibfUser);
            return $ibfToken;

        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in getAdminUserCredentialsInIBF: " . $e->getMessage());
            return null;
        }
    }

    private function createIbfUserAndGetToken($user, $log = null): ?string
    {
        try {
            if ($log) $log->info("[IBF-AUTH] Starting IBF user creation process...");
            
            $ibfEmail = $user->get('emailAddress');
            if (!$ibfEmail) {
                if ($log) $log->error("[IBF-AUTH] User has no email address, cannot create IBF account for user: " . $user->get('id'));
                return null;
            }
            
            if ($log) $log->info("[IBF-AUTH] Creating IBF user with email: " . $ibfEmail);
            $ibfPassword = $this->generateSecurePassword(20);
            if ($log) $log->debug("[IBF-AUTH] Generated secure password for IBF user");
            
            // Extract WhatsApp number from phone data
            $whatsappNumber = $this->extractWhatsAppNumber($user, $log);
            
            // Get admin token for user creation
            $adminToken = $this->getAdminUserCredentialsInIBF($log);
            if (!$adminToken) {
                if ($log) $log->error("[IBF-AUTH] Failed to get admin token for user creation");
                return null;
            }
            
            $ibfApiUrl = 'https://ibf-test.510.global/api/user';
            $postData = json_encode([
                'email' => $ibfEmail,
                'firstName' => $user->get('firstName') ?: 'EspoCRM',
                'middleName' => null,
                'lastName' => $user->get('lastName') ?: 'User',
                'userRole' => 'viewer',
                'countryCodesISO3' => [
                    "UGA",
                    "ZMB", 
                    "MWI",
                    "SSD",
                    "KEN",
                    "ETH",
                    "PHL",
                    "ZWE",
                    "LSO"
                ],
                'disasterTypes' => [
                    "floods",
                    "malaria",
                    "drought",
                    "typhoon",
                    "flash-floods"
                ],
                'password' => $ibfPassword,
                'whatsappNumber' => $whatsappNumber
            ]);
            
            if ($log) $log->debug("[IBF-AUTH] Sending user creation request to IBF API: " . $ibfApiUrl);
            if ($log) $log->debug("[IBF-AUTH] User creation payload: " . json_encode([
                'email' => $ibfEmail,
                'firstName' => $user->get('firstName') ?: 'EspoCRM',
                'middleName' => null,
                'lastName' => $user->get('lastName') ?: 'User',
                'userRole' => 'viewer',
                'countryCodesISO3' => "[array of 9 countries]",
                'disasterTypes' => "[array of 5 disaster types]", 
                'password' => '[REDACTED]',
                'whatsappNumber' => $whatsappNumber
            ]));
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $ibfApiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($postData),
                'Authorization: Bearer ' . $adminToken
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($log) $log->info("[IBF-AUTH] IBF API user creation response - HTTP Code: " . $httpCode);
            if ($curlError && $log) {
                $log->error("[IBF-AUTH] CURL Error: " . $curlError);
            }
            
            if ($httpCode !== 201) {
                if ($log) $log->error("[IBF-AUTH] IBF API user creation failed with HTTP code: " . $httpCode . " Response: " . $response);
                
                // Check if user already exists (HTTP 409 or similar error)
                if ($httpCode === 409 || ($response && (strpos($response, 'Email must be unique') !== false || strpos($response, 'duplicate') !== false))) {
                    if ($log) $log->info("[IBF-AUTH] User already exists in IBF, attempting to update password...");
                    return $this->updateExistingIbfUserPassword($user, $ibfEmail, $ibfPassword, $adminToken, $log);
                }
                
                return null;
            }
            
            if ($log) $log->debug("[IBF-AUTH] IBF API user creation successful, parsing response...");
            $responseData = json_decode($response, true);
            
            if (!$responseData || !isset($responseData['user']['token'])) {
                if ($log) $log->error("[IBF-AUTH] IBF API user creation response missing token: " . $response);
                return null;
            }
            
            if ($log) $log->info("[IBF-AUTH] IBF token received from user creation, saving credentials to EspoCRM...");
            $saveResult = $this->saveIbfCredentialsToUser($user, $ibfEmail, $ibfPassword, $log);
            
            if (!$saveResult && $log) {
                $log->warning("[IBF-AUTH] Failed to save IBF credentials, but continuing with token");
            }
            
            if ($log) $log->info("[IBF-AUTH] IBF user creation process completed successfully");
            return $responseData['user']['token'];
            
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in createIbfUserAndGetToken: " . $e->getMessage());
            if ($log) $log->error("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    private function updateExistingIbfUserPassword($user, $ibfEmail, $ibfPassword, $adminToken, $log = null): ?string
    {
        try {
            if ($log) $log->info("[IBF-AUTH] Attempting to update password for existing IBF user: " . $ibfEmail);
            
            $ibfApiUrl = 'https://ibf-test.510.global/api/user/change-password';
            $postData = json_encode([
                'email' => $ibfEmail,
                'password' => $ibfPassword
            ]);
            
            if ($log) $log->debug("[IBF-AUTH] Sending password update request to IBF API: " . $ibfApiUrl);
            if ($log) $log->debug("[IBF-AUTH] Password update payload: " . json_encode(['email' => $ibfEmail, 'password' => '[REDACTED]']));
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $ibfApiUrl);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($postData),
                'Authorization: Bearer ' . $adminToken
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($log) $log->info("[IBF-AUTH] IBF API password update response - HTTP Code: " . $httpCode);
            if ($curlError && $log) {
                $log->error("[IBF-AUTH] CURL Error during password update: " . $curlError);
            }
            
            if ($httpCode !== 200 && $httpCode !== 201) {
                if ($log) $log->error("[IBF-AUTH] IBF API password update failed with HTTP code: " . $httpCode . " Response: " . $response);
                return null;
            }
            
            if ($log) $log->info("[IBF-AUTH] Password update successful, attempting to login with new credentials...");
            
            // Now try to login with the updated password
            $ibfToken = $this->loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log);
            if (!$ibfToken) {
                if ($log) $log->error("[IBF-AUTH] Failed to login after password update");
                return null;
            }
            
            if ($log) $log->info("[IBF-AUTH] Login successful after password update, saving credentials to EspoCRM...");
            $saveResult = $this->saveIbfCredentialsToUser($user, $ibfEmail, $ibfPassword, $log);
            
            if (!$saveResult && $log) {
                $log->warning("[IBF-AUTH] Failed to save IBF credentials after password update, but continuing with token");
            }
            
            return $ibfToken;
            
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in updateExistingIbfUserPassword: " . $e->getMessage());
            if ($log) $log->error("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    private function loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log = null): ?string
    {
        try {
            if ($log) $log->info("[IBF-AUTH] Starting IBF user login process for email: " . $ibfEmail);
            
            $ibfApiUrl = 'https://ibf-test.510.global/api/user/login';
            $postData = json_encode([
                'email' => $ibfEmail,
                'password' => $ibfPassword
            ]);
            
            if ($log) $log->debug("[IBF-AUTH] Sending login request to IBF API: " . $ibfApiUrl);
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $ibfApiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($postData)
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($log) $log->info("[IBF-AUTH] IBF API login response - HTTP Code: " . $httpCode);
            if ($curlError && $log) {
                $log->error("[IBF-AUTH] CURL Error: " . $curlError);
            }
            
            if ($httpCode !== 200 && $httpCode !== 201) {
                if ($log) $log->error("[IBF-AUTH] IBF API login failed with HTTP code: " . $httpCode . " Response: " . $response);
                return null;
            }
            
            if ($log) $log->debug("[IBF-AUTH] IBF API login successful, parsing response...");
            $responseData = json_decode($response, true);
            
            if (!$responseData || !isset($responseData['user']['token'])) {
                if ($log) $log->error("[IBF-AUTH] IBF API login response missing token: " . $response);
                return null;
            }
            
            if ($log) $log->info("[IBF-AUTH] IBF login process completed successfully");
            return $responseData['user']['token'];
            
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in loginIbfUserAndGetToken: " . $e->getMessage());
            if ($log) $log->error("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    private function extractWhatsAppNumber($user, $log = null): string
    {
        try {
            if ($log) $log->debug("[IBF-AUTH] Extracting WhatsApp number from user phone data...");
            
            // Get phone number data from EspoCRM
            $phoneNumberData = $user->get('phoneNumberData');
            
            if (!$phoneNumberData || empty($phoneNumberData)) {
                if ($log) $log->debug("[IBF-AUTH] No phone number data found, using default");
                return '+31644000000';
            }
            
            if ($log) $log->debug("[IBF-AUTH] Found phone number data with " . count($phoneNumberData) . " entries");
            
            // Filter mobile numbers
            $mobileNumbers = [];
            foreach ($phoneNumberData as $phoneData) {
                if (isset($phoneData['type']) && strtolower($phoneData['type']) === 'mobile') {
                    $mobileNumbers[] = $phoneData;
                    if ($log) $log->debug("[IBF-AUTH] Found mobile number: " . ($phoneData['phoneNumber'] ?? 'unknown') . 
                                         " (primary: " . (($phoneData['primary'] ?? false) ? 'yes' : 'no') . ")");
                }
            }
            
            if (empty($mobileNumbers)) {
                if ($log) $log->debug("[IBF-AUTH] No mobile numbers found, using default");
                return '+31644000000';
            }
            
            // Look for primary mobile number first
            foreach ($mobileNumbers as $mobile) {
                if ($mobile['primary'] ?? false) {
                    $whatsappNumber = $mobile['phoneNumber'] ?? '+31644000000';
                    if ($log) $log->info("[IBF-AUTH] Using primary mobile number for WhatsApp: " . $whatsappNumber);
                    return $whatsappNumber;
                }
            }
            
            // If no primary mobile, use the first mobile number
            $whatsappNumber = $mobileNumbers[0]['phoneNumber'] ?? '+31644000000';
            if ($log) $log->info("[IBF-AUTH] Using first mobile number for WhatsApp: " . $whatsappNumber);
            return $whatsappNumber;
            
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in extractWhatsAppNumber: " . $e->getMessage());
            return '+31644000000';
        }
    }

    private function generateSecurePassword($length = 20): string
    {
        $log = $GLOBALS['log'] ?? null;
        if ($log) $log->debug("[IBF-AUTH] Generating secure password of length: " . $length);
        
        // Character sets for secure password generation
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $numbers = '0123456789';
        $specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Combine all character sets
        $allChars = $lowercase . $uppercase . $numbers . $specialChars;
        
        // Ensure password contains at least one character from each set
        $password = '';
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $specialChars[random_int(0, strlen($specialChars) - 1)];
        
        // Fill the rest with random characters
        for ($i = 4; $i < $length; $i++) {
            $password .= $allChars[random_int(0, strlen($allChars) - 1)];
        }
        
        // Shuffle the password to randomize character positions
        $shuffledPassword = str_shuffle($password);
        
        if ($log) $log->debug("[IBF-AUTH] Secure password generated successfully");
        return $shuffledPassword;
    }

    private function saveIbfCredentialsToUser($user, $ibfEmail, $ibfPassword, $log = null): bool
    {
        try {
            if ($log) $log->debug("[IBF-AUTH] Attempting to save IBF credentials to user record...");

            $user->set('cIbfEmail', $ibfEmail);
            $user->set('cIBFpassword', $ibfPassword);
            $this->entityManager->saveEntity($user);

            if ($log) $log->info("[IBF-AUTH] IBF credentials saved successfully for user: " . $user->get('id'));
            return true;
        } catch (Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in saveIbfCredentialsToUser: " . $e->getMessage());
            if ($log) $log->error("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }



    /**
     * Set CORS headers to allow cross-origin requests from different domains
     */
    private function setCorsHeaders(): void
    {
        // Get the origin from the request
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        
        // List of allowed origins
        $allowedOrigins = [
            'https://ibf-pivot.510.global',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:8080'
        ];
        
        // Check if the origin is allowed
        if (in_array($origin, $allowedOrigins) || $origin === '*') {
            header('Access-Control-Allow-Origin: ' . $origin);
        } else {
            header('Access-Control-Allow-Origin: https://ibf-pivot.510.global');
        }
        
        // Allow specific HTTP methods
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        
        // Allow specific headers
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
        
        // Allow credentials
        header('Access-Control-Allow-Credentials: true');
        
        // Set max age for preflight cache
        header('Access-Control-Max-Age: 86400'); // 24 hours
        
        // Set content type for JSON responses
        header('Content-Type: application/json');
    }
}