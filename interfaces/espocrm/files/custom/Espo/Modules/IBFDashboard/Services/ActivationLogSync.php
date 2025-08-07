<?php

namespace Espo\Modules\IBFDashboard\Services;

use Espo\Core\Utils\Log;
use Espo\Core\Utils\Config;
use Espo\ORM\EntityManager;
use Exception;
use DateTime;

class ActivationLogSync
{
    private $log;
    private $config;
    private $entityManager;

    public function __construct(Log $log, Config $config, EntityManager $entityManager)
    {
        $this->log = $log;
        $this->config = $config;
        $this->entityManager = $entityManager;
    }

    /**
     * Convert ISO datetime string to EspoCRM format
     */
    private function convertIsoDateTimeToEspo($isoDateTime)
    {
        if (empty($isoDateTime)) {
            return null;
        }

        try {
            $date = new DateTime($isoDateTime);
            return $date->format('Y-m-d H:i:s');
        } catch (Exception $e) {
            $this->log->error('IBF ActivationLog Sync: Failed to convert datetime: ' . $isoDateTime . ' - ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Sync activation logs from IBF API for all enabled country/disaster type combinations
     */
    public function syncAllActivationLogs(): array
    {
        $results = [
            'success' => true,
            'message' => '',
            'processed' => 0,
            'created' => 0,
            'updated' => 0,
            'errors' => []
        ];

        try {
            $this->log->info('IBF ActivationLog Sync: Starting sync process');

            // Get enabled countries and disaster types from settings
            $enabledCountries = $this->config->get('ibfEnabledCountries', []);
            $enabledDisasterTypes = $this->config->get('ibfDisasterTypes', []);

            if (empty($enabledCountries) || empty($enabledDisasterTypes)) {
                $results['success'] = false;
                $results['message'] = 'No enabled countries or disaster types configured';
                $this->log->warning('IBF ActivationLog Sync: No enabled countries or disaster types configured');
                return $results;
            }

            $this->log->info('IBF ActivationLog Sync: Processing ' . count($enabledCountries) . ' countries and ' . count($enabledDisasterTypes) . ' disaster types');

            // Get IBF credentials for API access
            $ibfToken = $this->getSystemIBFToken();
            if (!$ibfToken) {
                $results['success'] = false;
                $results['message'] = 'Could not obtain IBF API token';
                $this->log->error('IBF ActivationLog Sync: Could not obtain IBF API token');
                return $results;
            }

            // Process each country/disaster type combination
            foreach ($enabledCountries as $countryCode) {
                foreach ($enabledDisasterTypes as $disasterType) {
                    try {
                        $syncResult = $this->syncActivationLogsForCountryAndDisaster($countryCode, $disasterType, $ibfToken);
                        $results['processed']++;
                        $results['created'] += $syncResult['created'];
                        $results['updated'] += $syncResult['updated'];

                        if (!$syncResult['success']) {
                            $results['errors'][] = "Failed for {$countryCode}/{$disasterType}: " . $syncResult['message'];
                        }
                    } catch (Exception $e) {
                        $results['errors'][] = "Exception for {$countryCode}/{$disasterType}: " . $e->getMessage();
                        $this->log->error('IBF ActivationLog Sync: Exception for ' . $countryCode . '/' . $disasterType . ': ' . $e->getMessage());
                    }
                }
            }

            $results['message'] = "Processed {$results['processed']} combinations. Created: {$results['created']}, Updated: {$results['updated']}, Errors: " . count($results['errors']);
            $this->log->info('IBF ActivationLog Sync: ' . $results['message']);

        } catch (Exception $e) {
            $results['success'] = false;
            $results['message'] = 'Sync failed: ' . $e->getMessage();
            $this->log->error('IBF ActivationLog Sync: Exception in syncAllActivationLogs: ' . $e->getMessage());
        }

        return $results;
    }

    /**
     * Sync activation logs for a specific country and disaster type
     */
    private function syncActivationLogsForCountryAndDisaster(string $countryCode, string $disasterType, string $ibfToken): array
    {
        $result = [
            'success' => true,
            'message' => '',
            'created' => 0,
            'updated' => 0
        ];

        try {
            $this->log->debug("IBF ActivationLog Sync: Fetching data for {$countryCode}/{$disasterType}");

            // Make API call to IBF backend
            $activations = $this->fetchActivationLogsFromIBF($countryCode, $disasterType, $ibfToken);

            if (!$activations || !is_array($activations)) {
                $result['message'] = 'No activations returned from API';
                return $result;
            }

            $this->log->debug("IBF ActivationLog Sync: Processing " . count($activations) . " activations for {$countryCode}/{$disasterType}");

            // Process each activation
            foreach ($activations as $activationData) {
                try {
                    $syncResult = $this->processActivationLogRecord($activationData);
                    if ($syncResult['created']) {
                        $result['created']++;
                    } elseif ($syncResult['updated']) {
                        $result['updated']++;
                    }
                } catch (Exception $e) {
                    $this->log->error('IBF ActivationLog Sync: Error processing activation: ' . $e->getMessage());
                }
            }

            $result['message'] = "Created: {$result['created']}, Updated: {$result['updated']}";
            $this->log->debug("IBF ActivationLog Sync: {$countryCode}/{$disasterType} - " . $result['message']);

        } catch (Exception $e) {
            $result['success'] = false;
            $result['message'] = $e->getMessage();
            $this->log->error('IBF ActivationLog Sync: Exception for ' . $countryCode . '/' . $disasterType . ': ' . $e->getMessage());
        }

        return $result;
    }

    /**
     * Process a single activation log record from API
     */
    private function processActivationLogRecord(array $activationData): array
    {
        $result = ['created' => false, 'updated' => false];

        try {
            // Check if activation already exists by databaseId
            $existingActivation = $this->entityManager->getRepository('ActivationLog')
                ->where('databaseId', $activationData['databaseId'])
                ->findOne();

            if ($existingActivation) {
                // Update existing record
                $this->updateActivationLogFromData($existingActivation, $activationData);
                $this->entityManager->saveEntity($existingActivation);
                $result['updated'] = true;
                $this->log->debug('IBF ActivationLog Sync: Updated activation: ' . $activationData['databaseId']);
            } else {
                // Create new record
                $activation = $this->entityManager->getEntity('ActivationLog');
                $this->updateActivationLogFromData($activation, $activationData);
                $this->entityManager->saveEntity($activation);
                $result['created'] = true;
                $this->log->debug('IBF ActivationLog Sync: Created activation: ' . $activationData['databaseId']);
            }

        } catch (Exception $e) {
            $this->log->error('IBF ActivationLog Sync: Error processing activation record: ' . $e->getMessage());
            throw $e;
        }

        return $result;
    }

    /**
     * Update ActivationLog entity from API data
     */
    private function updateActivationLogFromData($activation, array $data)
    {
        // Map API fields to entity fields
        $activation->set('name', $data['name'] ?? '');
        $activation->set('countryCodeISO3', $data['countryCodeISO3'] ?? '');
        $activation->set('disasterType', $data['disasterType'] ?? '');
        $activation->set('eventName', $data['eventName'] ?? '');
        $activation->set('placeCode', $data['placeCode'] ?? '');
        $activation->set('exposureIndicator', $data['exposureIndicator'] ?? '');
        $activation->set('exposureValue', $data['exposureValue'] ?? 0);
        $activation->set('alertLevel', $data['alertLevel'] ?? '');
        $activation->set('closed', $data['closed'] ?? false);
        $activation->set('userTrigger', $data['userTrigger'] ?? false);
        $activation->set('databaseId', $data['databaseId'] ?? '');

        // Convert and set datetime fields
        if (!empty($data['firstIssuedDate'])) {
            $firstIssuedDate = $this->convertIsoDateTimeToEspo($data['firstIssuedDate']);
            if ($firstIssuedDate) {
                $activation->set('firstIssuedDate', $firstIssuedDate);
                $activation->set('firstIssuedDateDate', substr($firstIssuedDate, 0, 10));
            }
        }

        if (!empty($data['endDate'])) {
            $endDate = $this->convertIsoDateTimeToEspo($data['endDate']);
            if ($endDate) {
                $activation->set('endDate', $endDate);
                $activation->set('endDateDate', substr($endDate, 0, 10));
            }
        }

        if (!empty($data['userTriggerDate'])) {
            $userTriggerDate = $this->convertIsoDateTimeToEspo($data['userTriggerDate']);
            if ($userTriggerDate) {
                $activation->set('userTriggerDate', $userTriggerDate);
                $activation->set('userTriggerDateDate', substr($userTriggerDate, 0, 10));
            }
        }

        // Set country name if available (could be derived from countryCodeISO3)
        $activation->set('countryName', $this->getCountryNameFromCode($data['countryCodeISO3'] ?? ''));
    }

    /**
     * Fetch activation logs from IBF API
     */
    private function fetchActivationLogsFromIBF(string $countryCode, string $disasterType, string $token): ?array
    {
        try {
            $ibfApiUrl = $this->config->get('ibfApiUrl');
            if (!$ibfApiUrl) {
                throw new Exception('IBF API URL not configured');
            }

            $url = rtrim($ibfApiUrl, '/') . '/api/event/activation-log';
            $url .= '?countryCodeISO3=' . urlencode($countryCode);
            $url .= '&disasterType=' . urlencode($disasterType);

            $this->log->debug('IBF ActivationLog Sync: Calling API: ' . $url);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                throw new Exception('cURL error: ' . $error);
            }

            if ($httpCode !== 200) {
                throw new Exception('HTTP error: ' . $httpCode . ' - ' . $response);
            }

            $data = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('JSON decode error: ' . json_last_error_msg());
            }

            return $data;

        } catch (Exception $e) {
            $this->log->error('IBF ActivationLog Sync: API fetch error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get system IBF token for API access
     */
    private function getSystemIBFToken(): ?string
    {
        try {
            // Use the same token retrieval method as EarlyActionSync
            $ibfUsername = $this->config->get('ibfUsername');
            $ibfPassword = $this->config->get('ibfPassword');
            $ibfApiUrl = $this->config->get('ibfApiUrl');

            if (!$ibfUsername || !$ibfPassword || !$ibfApiUrl) {
                $this->log->error('IBF ActivationLog Sync: Missing IBF credentials in config');
                return null;
            }

            $loginUrl = rtrim($ibfApiUrl, '/') . '/api/user/login';

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $loginUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'email' => $ibfUsername,
                'password' => $ibfPassword
            ]));

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200) {
                $data = json_decode($response, true);
                return $data['user']['token'] ?? null;
            }

            $this->log->error('IBF ActivationLog Sync: Failed to get token, HTTP code: ' . $httpCode);
            return null;

        } catch (Exception $e) {
            $this->log->error('IBF ActivationLog Sync: Exception getting token: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get country name from ISO3 code
     */
    private function getCountryNameFromCode(string $countryCode): string
    {
        $countryNames = [
            'ETH' => 'Ethiopia',
            'KEN' => 'Kenya',
            'UGA' => 'Uganda',
            'PHL' => 'Philippines',
            'ZMB' => 'Zambia',
            'ZWE' => 'Zimbabwe',
            'MLI' => 'Mali',
            'EGY' => 'Egypt'
        ];

        return $countryNames[$countryCode] ?? $countryCode;
    }
}
