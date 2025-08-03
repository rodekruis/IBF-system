<?php

namespace Espo\Modules\IBFDashboard\Controllers;

use Espo\Core\Controllers\Base;
use Espo\Core\Api\Request;
use Espo\Core\ORM\EntityManager;
use Espo\Core\InjectableFactory;
use Espo\Entities\User;

class IbfAuth extends Base
{
    protected function getEntityManager(): EntityManager
    {
        return $this->getContainer()->getByClass(EntityManager::class);
    }

    protected function getInjectableFactory(): InjectableFactory
    {
        return $this->getContainer()->getByClass(InjectableFactory::class);
    }

    public function actionGetToken(Request $request): array
    {
        // Enhanced logging - use both global log and error_log for debugging
        $log = $GLOBALS['log'] ?? null;
        
        // Always log to error_log for debugging when regular logging fails
        error_log("[IBF-AUTH] === Starting IBF token request ===");
        if ($log) {
            $log->info("[IBF-AUTH] === Starting IBF token request ===");
        }
        
        try {
            // Check configuration first
            $config = $this->getInjectableFactory()->create('Espo\\Core\\Utils\\Config');
            $ibfBackendApiUrl = $config->get('ibfBackendApiUrl');
            $ibfAdminUserId = $config->get('ibfAdminUserId');
            
            error_log("[IBF-AUTH] Configuration check:");
            error_log("[IBF-AUTH] - ibfBackendApiUrl: " . ($ibfBackendApiUrl ?: 'NOT SET'));
            error_log("[IBF-AUTH] - ibfAdminUserId: " . ($ibfAdminUserId ?: 'NOT SET'));
            
            if ($log) {
                $log->info("[IBF-AUTH] Configuration check:");
                $log->info("[IBF-AUTH] - ibfBackendApiUrl: " . ($ibfBackendApiUrl ?: 'NOT SET'));
                $log->info("[IBF-AUTH] - ibfAdminUserId: " . ($ibfAdminUserId ?: 'NOT SET'));
            }
            
            if (!$ibfBackendApiUrl) {
                $errorMsg = "[IBF-AUTH] IBF Backend API URL not configured - please set 'ibfBackendApiUrl' in EspoCRM configuration";
                error_log($errorMsg);
                if ($log) $log->error($errorMsg);
                return [
                    'success' => false,
                    'error' => 'IBF Backend API URL not configured'
                ];
            }
            
            if (!$ibfAdminUserId) {
                $errorMsg = "[IBF-AUTH] IBF Admin User ID not configured - please set 'ibfAdminUserId' in EspoCRM configuration";
                error_log($errorMsg);
                if ($log) $log->error($errorMsg);
                return [
                    'success' => false,
                    'error' => 'IBF Admin User ID not configured'
                ];
            }
            
            // Get current user from EspoCRM Base controller
            $user = $this->getUser();
            
            if (!$user) {
                $errorMsg = "[IBF-AUTH] No authenticated user found in EspoCRM context";
                error_log($errorMsg);
                if ($log) $log->error($errorMsg);
                return [
                    'success' => false,
                    'error' => 'No authenticated user'
                ];
            }
            
            $userEmail = $user->get('emailAddress');
            $userName = $user->get('userName');
            error_log("[IBF-AUTH] Getting IBF token for user: " . $userEmail . " (" . $userName . ")");
            if ($log) $log->info("[IBF-AUTH] Getting IBF token for user: " . $userEmail . " (" . $userName . ")");
            
            // Get IBF token for this user
            $ibfToken = $this->getIbfApiToken($user, $log);
            
            if (!$ibfToken) {
                $errorMsg = "[IBF-AUTH] Failed to retrieve IBF API token - check getIbfApiToken method";
                error_log($errorMsg);
                if ($log) $log->error($errorMsg);
                return [
                    'success' => false,
                    'error' => 'Failed to retrieve IBF API token'
                ];
            }
            
            error_log("[IBF-AUTH] IBF API token retrieved successfully");
            error_log("[IBF-AUTH] === IBF token request completed successfully ===");
            if ($log) $log->info("[IBF-AUTH] IBF API token retrieved successfully");
            if ($log) $log->info("[IBF-AUTH] === IBF token request completed successfully ===");
            
            return [
                'success' => true,
                'token' => $ibfToken
            ];
        } catch (\Exception $e) {
            $errorMsg = "[IBF-AUTH] Exception in actionGetToken: " . $e->getMessage();
            $traceMsg = "[IBF-AUTH] Stack trace: " . $e->getTraceAsString();
            error_log($errorMsg);
            error_log($traceMsg);
            if ($log) $log->error($errorMsg);
            if ($log) $log->error($traceMsg);
            return [
                'success' => false,
                'error' => 'Token request failed: ' . $e->getMessage()
            ];
        }
    }

    private function getIbfUserForUser(string $userId)
    {
        return $this->getEntityManager()
            ->getRDBRepository('IBFUser')
            ->where(['userId' => $userId])
            ->findOne();
    }

    private function getIbfApiToken($user, $log = null): ?string
    {
        try {
            error_log("[IBF-AUTH] Starting getIbfApiToken for user: " . $user->getId());
            if ($log) $log->debug("[IBF-AUTH] Checking for existing IBF credentials in IBFUser entity...");
            
            // Look up the IBFUser record for this user
            $ibfUser = $this->getEntityManager()
                ->getRDBRepository('IBFUser')
                ->where([
                    'userId' => $user->getId()
                ])
                ->findOne();
                
            if (!$ibfUser) {
                error_log("[IBF-AUTH] No IBFUser record found, creating new IBF user...");
                if ($log) $log->info("[IBF-AUTH] No IBFUser record found, creating new IBF user...");
                return $this->createIbfUserAndGetToken($user, $log);
            }
            
            $ibfEmail = $ibfUser->get('email');
            $ibfPassword = $ibfUser->get('password');

            error_log("[IBF-AUTH] IBF credentials check - Email: " . ($ibfEmail ? 'exists' : 'missing') . ", Password: " . ($ibfPassword ? 'exists' : 'missing'));
            if ($log) $log->info("[IBF-AUTH] IBF credentials check - Email: " . ($ibfEmail ? 'exists' : 'missing') . ", Password: " . ($ibfPassword ? 'exists' : 'missing'));
            
            if (!$ibfEmail || !$ibfPassword) {
                error_log("[IBF-AUTH] IBFUser record missing credentials, creating new IBF user...");
                if ($log) $log->info("[IBF-AUTH] IBFUser record missing credentials, creating new IBF user...");
                return $this->createIbfUserAndGetToken($user, $log);
            }
            
            // Use the stored credentials to login
            error_log("[IBF-AUTH] Found IBF credentials, attempting login...");
            if ($log) $log->info("[IBF-AUTH] Found IBF credentials, attempting login...");
            return $this->loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log);
        } catch (\Exception $e) {
            error_log("[IBF-AUTH] Exception in getIbfApiToken: " . $e->getMessage());
            error_log("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            if ($log) $log->error("[IBF-AUTH] Exception in getIbfApiToken: " . $e->getMessage());
            return null;
        }
    }

    private function getIbfApiTokenFromIbfUser($ibfUser, $log = null): ?string
    {
        try {
            if ($log) $log->debug("[IBF-AUTH] Getting IBF API token from IBFUser record...");
            
            $ibfEmail = $ibfUser->get('email');
            $ibfPassword = $ibfUser->get('password');
            
            if ($log) $log->info("[IBF-AUTH] IBFUser credentials check - Email: " . ($ibfEmail ? 'exists' : 'missing') . ", Password: " . ($ibfPassword ? 'exists' : 'missing'));
            
            if (!$ibfEmail || !$ibfPassword) {
                if ($log) $log->warning("[IBF-AUTH] IBFUser record missing credentials - Email: " . ($ibfEmail ?: 'missing') . ", Password: " . ($ibfPassword ? 'exists' : 'missing'));
                return null;
            }
            
            if ($log) $log->info("[IBF-AUTH] Found IBFUser credentials, attempting login...");
            return $this->loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log);
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in getIbfApiTokenFromIbfUser: " . $e->getMessage());
            return null;
        }
    }

    private function getAdminUserCredentialsInIBF($log = null): ?string
    {
        try {
            error_log("[IBF-AUTH] Getting admin user credentials from IBFUser record...");
            if ($log) $log->debug("[IBF-AUTH] Getting admin user credentials from IBFUser record...");
            
            // Get the admin user ID from IBF settings
            $config = $this->getInjectableFactory()->create('Espo\\Core\\Utils\\Config');
            $adminUserId = $config->get('ibfAdminUserId');
            
            if (!$adminUserId) {
                error_log("[IBF-AUTH] No admin user configured in IBF settings");
                if ($log) $log->error("[IBF-AUTH] No admin user configured in IBF settings");
                return null;
            }
            
            error_log("[IBF-AUTH] Looking up IBFUser record for admin userId: " . $adminUserId);
            if ($log) $log->debug("[IBF-AUTH] Looking up IBFUser record for admin userId: " . $adminUserId);
            
            // Look up the IBFUser record for the admin user
            $ibfUser = $this->getEntityManager()
                ->getRDBRepository('IBFUser')
                ->where([
                    'userId' => $adminUserId
                ])
                ->findOne();
                
            if (!$ibfUser) {
                error_log("[IBF-AUTH] No IBFUser record found for admin userId: " . $adminUserId);
                if ($log) $log->error("[IBF-AUTH] No IBFUser record found for admin userId: " . $adminUserId);
                return null;
            }
            
            $ibfEmail = $ibfUser->get('email');
            $ibfPassword = $ibfUser->get('password');

            if (!$ibfEmail || !$ibfPassword) {
                error_log("[IBF-AUTH] IBF admin credentials missing in IBFUser record");
                if (!$ibfEmail) error_log("[IBF-AUTH] Missing email in IBFUser record");
                if (!$ibfPassword) error_log("[IBF-AUTH] Missing password in IBFUser record");
                
                if ($log) {
                    $log->error("[IBF-AUTH] IBF admin credentials missing in IBFUser record");
                    if (!$ibfEmail) $log->error("[IBF-AUTH] Missing email in IBFUser record");
                    if (!$ibfPassword) $log->error("[IBF-AUTH] Missing password in IBFUser record");
                }
                return null;
            }

            error_log("[IBF-AUTH] Retrieved admin credentials from IBFUser, attempting login...");
            error_log("[IBF-AUTH] Admin email: " . $ibfEmail);
            if ($log) $log->debug("[IBF-AUTH] Retrieved admin credentials from IBFUser, attempting login...");
            if ($log) $log->debug("[IBF-AUTH] Admin email: " . $ibfEmail);

            // Login to IBF backend API - use configurable URL
            $ibfBackendApiUrl = $config->get('ibfBackendApiUrl');
            $loginUrl = $ibfBackendApiUrl . '/user/login';
            $loginData = [
                'email' => $ibfEmail,
                'password' => $ibfPassword
            ];
            $postData = json_encode($loginData);
            
            error_log("[IBF-AUTH] Sending login request to: " . $loginUrl);
            if ($log) $log->debug("[IBF-AUTH] Sending login request to: " . $loginUrl);
            if ($log) $log->debug("[IBF-AUTH] Login payload: " . json_encode(['email' => $ibfEmail, 'password' => '[REDACTED]']));
            
            $curl = curl_init($loginUrl);
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

            error_log("[IBF-AUTH] Admin login response - HTTP Code: " . $httpCode);
            if ($log) $log->debug("[IBF-AUTH] Admin login response - HTTP Code: " . $httpCode);
            if ($curlError) {
                error_log("[IBF-AUTH] CURL Error during admin login: " . $curlError);
                if ($log) $log->error("[IBF-AUTH] CURL Error during admin login: " . $curlError);
            }
            if ($response) {
                error_log("[IBF-AUTH] Admin login response body: " . $response);
                if ($log) $log->debug("[IBF-AUTH] Admin login response body: " . $response);
            }

            if (($httpCode !== 200 && $httpCode !== 201) || !$response) {
                error_log("[IBF-AUTH] Failed to get admin credentials from IBF API - HTTP Code: " . $httpCode);
                if ($response) {
                    error_log("[IBF-AUTH] Error response body: " . $response);
                    // Try to parse error response for more details
                    $errorData = json_decode($response, true);
                    if ($errorData && isset($errorData['message'])) {
                        error_log("[IBF-AUTH] IBF API Error: " . $errorData['message']);
                    }
                } else {
                    error_log("[IBF-AUTH] No response body received");
                }
                if ($curlError) {
                    error_log("[IBF-AUTH] cURL Error: " . $curlError);
                }
                
                // Provide specific troubleshooting based on error code
                if ($httpCode === 401) {
                    error_log("[IBF-AUTH] ==> TROUBLESHOOTING: HTTP 401 Unauthorized means the admin credentials are invalid");
                    error_log("[IBF-AUTH] ==> SOLUTION 1: Update the IBFUser record for userId " . $adminUserId . " with correct plain text password");
                    error_log("[IBF-AUTH] ==> SOLUTION 2: Add 'ibfAdminPassword' configuration with correct password");
                    error_log("[IBF-AUTH] ==> SOLUTION 3: Reset password for admin user " . $ibfEmail . " in IBF backend");
                }
                
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
                error_log("[IBF-AUTH] No token received from IBF API admin login");
                if ($log) $log->error("[IBF-AUTH] No token received from IBF API admin login");
                return null;
            }

            error_log("[IBF-AUTH] Successfully retrieved IBF token for admin user: " . $ibfEmail);
            if ($log) $log->debug("[IBF-AUTH] Successfully retrieved IBF token for admin user: " . $ibfEmail);
            return $ibfToken;

        } catch (\Exception $e) {
            error_log("[IBF-AUTH] Exception in getAdminUserCredentialsInIBF: " . $e->getMessage());
            error_log("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            if ($log) $log->error("[IBF-AUTH] Exception in getAdminUserCredentialsInIBF: " . $e->getMessage());
            return null;
        }
    }

    private function createIbfUserAndGetToken($user, $log = null): ?string
    {
        try {
            error_log("[IBF-AUTH] Starting IBF user creation process...");
            if ($log) $log->info("[IBF-AUTH] Starting IBF user creation process...");
            
            $ibfEmail = $user->get('emailAddress');
            if (!$ibfEmail) {
                $errorMsg = "[IBF-AUTH] User has no email address, cannot create IBF account for user: " . $user->get('id');
                error_log($errorMsg);
                if ($log) $log->error($errorMsg);
                return null;
            }
            
            error_log("[IBF-AUTH] Creating IBF user with email: " . $ibfEmail);
            if ($log) $log->info("[IBF-AUTH] Creating IBF user with email: " . $ibfEmail);
            $ibfPassword = $this->generateSecurePassword(20);
            error_log("[IBF-AUTH] Generated secure password for IBF user");
            if ($log) $log->debug("[IBF-AUTH] Generated secure password for IBF user");
            
            // Extract WhatsApp number from phone data
            $whatsappNumber = $this->extractWhatsAppNumber($user, $log);
            
            // Get admin token for user creation
            error_log("[IBF-AUTH] Getting admin token for user creation...");
            $adminToken = $this->getAdminUserCredentialsInIBF($log);
            if (!$adminToken) {
                $errorMsg = "[IBF-AUTH] Failed to get admin token for user creation";
                error_log($errorMsg);
                if ($log) $log->error($errorMsg);
                return null;
            }
            
            error_log("[IBF-AUTH] Admin token acquired successfully");
            
            // Use configurable IBF backend API URL for user operations
            $config = $this->getInjectableFactory()->create('Espo\\Core\\Utils\\Config');
            $ibfBackendApiUrl = $config->get('ibfBackendApiUrl');
            $createUserUrl = $ibfBackendApiUrl . '/user';
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
            
            error_log("[IBF-AUTH] Sending user creation request to IBF API: " . $createUserUrl);
            if ($log) $log->debug("[IBF-AUTH] Sending user creation request to IBF API: " . $createUserUrl);
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
            curl_setopt($ch, CURLOPT_URL, $createUserUrl);
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
            
            error_log("[IBF-AUTH] IBF API user creation response - HTTP Code: " . $httpCode);
            if ($log) $log->info("[IBF-AUTH] IBF API user creation response - HTTP Code: " . $httpCode);
            if ($curlError) {
                error_log("[IBF-AUTH] CURL Error: " . $curlError);
                if ($log) $log->error("[IBF-AUTH] CURL Error: " . $curlError);
            }
            
            if ($httpCode !== 201) {
                error_log("[IBF-AUTH] IBF API user creation failed with HTTP code: " . $httpCode . " Response: " . $response);
                if ($log) $log->error("[IBF-AUTH] IBF API user creation failed with HTTP code: " . $httpCode . " Response: " . $response);
                
                // Check if user already exists (HTTP 409 or similar error)
                if ($httpCode === 409 || ($response && (strpos($response, 'Email must be unique') !== false || strpos($response, 'duplicate') !== false))) {
                    error_log("[IBF-AUTH] User already exists in IBF, attempting to update password...");
                    if ($log) $log->info("[IBF-AUTH] User already exists in IBF, attempting to update password...");
                    return $this->updateExistingIbfUserPassword($user, $ibfEmail, $ibfPassword, $adminToken, $log);
                }
                
                return null;
            }
            
            error_log("[IBF-AUTH] IBF API user creation successful, parsing response...");
            if ($log) $log->debug("[IBF-AUTH] IBF API user creation successful, parsing response...");
            $responseData = json_decode($response, true);
            
            if (!$responseData || !isset($responseData['user']['token'])) {
                error_log("[IBF-AUTH] IBF API user creation response missing token: " . $response);
                if ($log) $log->error("[IBF-AUTH] IBF API user creation response missing token: " . $response);
                return null;
            }
            
            error_log("[IBF-AUTH] IBF token received from user creation, saving credentials to EspoCRM...");
            if ($log) $log->info("[IBF-AUTH] IBF token received from user creation, saving credentials to EspoCRM...");
            $saveResult = $this->saveIbfCredentialsToUser($user, $ibfEmail, $ibfPassword, $log);
            
            if (!$saveResult) {
                error_log("[IBF-AUTH] Failed to save IBF credentials, but continuing with token");
                if ($log) $log->warning("[IBF-AUTH] Failed to save IBF credentials, but continuing with token");
            }
            
            error_log("[IBF-AUTH] IBF user creation process completed successfully");
            if ($log) $log->info("[IBF-AUTH] IBF user creation process completed successfully");
            return $responseData['user']['token'];
            
        } catch (\Exception $e) {
            error_log("[IBF-AUTH] Exception in createIbfUserAndGetToken: " . $e->getMessage());
            error_log("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            if ($log) $log->error("[IBF-AUTH] Exception in createIbfUserAndGetToken: " . $e->getMessage());
            if ($log) $log->error("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    private function updateExistingIbfUserPassword($user, $ibfEmail, $ibfPassword, $adminToken, $log = null): ?string
    {
        try {
            if ($log) $log->info("[IBF-AUTH] Attempting to update password for existing IBF user: " . $ibfEmail);
            
            // Use configurable IBF backend API URL for user operations
            $config = $this->getInjectableFactory()->create('Espo\\Core\\Utils\\Config');
            $ibfBackendApiUrl = $config->get('ibfBackendApiUrl');
            $changePasswordUrl = $ibfBackendApiUrl . '/user/change-password';
            $postData = json_encode([
                'email' => $ibfEmail,
                'password' => $ibfPassword
            ]);
            
            if ($log) $log->debug("[IBF-AUTH] Sending password update request to IBF API: " . $changePasswordUrl);
            if ($log) $log->debug("[IBF-AUTH] Password update payload: " . json_encode(['email' => $ibfEmail, 'password' => '[REDACTED]']));
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $changePasswordUrl);
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

    private function loginIbfUserAndGetToken($ibfEmail, $ibfPassword, $log = null, $isRetryAfterPasswordReset = false): ?string
    {
        try {
            if ($log) $log->info("[IBF-AUTH] Starting IBF user login process for email: " . $ibfEmail);
            
            // Use configurable IBF backend API URL for authentication
            $config = $this->getInjectableFactory()->create('Espo\\Core\\Utils\\Config');
            $ibfBackendApiUrl = $config->get('ibfBackendApiUrl');
            $loginUrl = $ibfBackendApiUrl . '/user/login';
            $postData = json_encode([
                'email' => $ibfEmail,
                'password' => $ibfPassword
            ]);
            
            if ($log) $log->debug("[IBF-AUTH] Sending login request to IBF API: " . $loginUrl);
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $loginUrl);
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
                
                // If login failed with 401, try to reset the user's password (but only if this isn't already a retry)
                if ($httpCode === 401 && !$isRetryAfterPasswordReset) {
                    if ($log) $log->info("[IBF-AUTH] Login failed with 401, attempting password reset...");
                    
                    // Get admin token to perform password reset
                    $adminToken = $this->getAdminUserCredentialsInIBF($log);
                    if ($adminToken) {
                        if ($log) $log->info("[IBF-AUTH] Got admin token, attempting to reset password for user: " . $ibfEmail);
                        
                        // Generate a new password
                        $newPassword = $this->generateSecurePassword();
                        
                        // Try to update the password in IBF backend
                        $resetResult = $this->updateExistingIbfUserPassword(null, $ibfEmail, $newPassword, $adminToken, $log);
                        
                        if ($resetResult) {
                            if ($log) $log->info("[IBF-AUTH] Password reset successful, updating EspoCRM IBFUser record...");
                            
                            // Update the password in the EspoCRM IBFUser record
                            $this->saveOrUpdateIbfUserCredentials($ibfEmail, $newPassword, null, $log);
                            
                            // Try to login again with the new password (mark as retry to prevent infinite recursion)
                            if ($log) $log->info("[IBF-AUTH] Retrying login with new password...");
                            return $this->loginIbfUserAndGetToken($ibfEmail, $newPassword, $log, true);
                        } else {
                            if ($log) $log->warning("[IBF-AUTH] Password reset failed, user may not exist in IBF backend. Attempting to create user...");
                            
                            // Password reset failed, likely because user doesn't exist (404)
                            // Try to create the user using the existing createIbfUserAndGetToken method
                            // We need to find the EspoCRM user object for this email
                            $espoCrmUser = $this->getEntityManager()
                                ->getRDBRepository('User')
                                ->where(['emailAddress' => $ibfEmail])
                                ->findOne();
                                
                            if ($espoCrmUser) {
                                if ($log) $log->info("[IBF-AUTH] Found EspoCRM user, creating IBF user...");
                                $createResult = $this->createIbfUserAndGetToken($espoCrmUser, $log);
                                
                                if ($createResult) {
                                    if ($log) $log->info("[IBF-AUTH] User creation successful, returning token");
                                    return $createResult;
                                } else {
                                    if ($log) $log->error("[IBF-AUTH] User creation failed");
                                }
                            } else {
                                if ($log) $log->error("[IBF-AUTH] Could not find EspoCRM user for email: " . $ibfEmail);
                            }
                        }
                    } else {
                        if ($log) $log->error("[IBF-AUTH] Could not get admin token for password reset");
                    }
                }
                
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
        // Delegate to the consolidated function
        return $this->saveOrUpdateIbfUserCredentials($ibfEmail, $ibfPassword, $user, $log);
    }

    private function saveOrUpdateIbfUserCredentials($ibfEmail, $ibfPassword, $user = null, $log = null): bool
    {
        try {
            if ($log) $log->debug("[IBF-AUTH] Saving/updating IBF credentials for email: " . $ibfEmail);

            // Try to find existing IBFUser record by email first
            $ibfUser = $this->getEntityManager()
                ->getRDBRepository('IBFUser')
                ->where(['email' => $ibfEmail])
                ->findOne();
                
            // If not found by email and we have a user object, try by userId
            if (!$ibfUser && $user) {
                $ibfUser = $this->getEntityManager()
                    ->getRDBRepository('IBFUser')
                    ->where(['userId' => $user->getId()])
                    ->findOne();
            }
                
            if (!$ibfUser) {
                // Create new IBFUser record
                if (!$user) {
                    if ($log) $log->error("[IBF-AUTH] Cannot create new IBFUser record without user object");
                    return false;
                }
                
                $ibfUser = $this->getEntityManager()->createEntity('IBFUser', [
                    'userId' => $user->getId(),
                    'email' => $ibfEmail,
                    'password' => $ibfPassword,
                    'name' => $user->get('firstName') . ' ' . $user->get('lastName') . ' (IBF)'
                ]);
                
                if ($log) $log->info("[IBF-AUTH] Created new IBFUser record for email: " . $ibfEmail);
                return $ibfUser ? true : false;
            } else {
                // Update existing IBFUser record
                $ibfUser->set('email', $ibfEmail);
                $ibfUser->set('password', $ibfPassword);
                
                // Update userId if we have a user object and it's different
                if ($user && $ibfUser->get('userId') !== $user->getId()) {
                    $ibfUser->set('userId', $user->getId());
                    if ($log) $log->debug("[IBF-AUTH] Updated userId in IBFUser record");
                }
                
                $this->getEntityManager()->saveEntity($ibfUser);
                
                if ($log) $log->info("[IBF-AUTH] Updated existing IBFUser record for email: " . $ibfEmail);
                return true;
            }
        } catch (\Exception $e) {
            if ($log) $log->error("[IBF-AUTH] Exception in saveOrUpdateIbfUserCredentials: " . $e->getMessage());
            if ($log) $log->error("[IBF-AUTH] Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }
}
