<?php

namespace Espo\Modules\IBFDashboard\Services;

use Espo\ORM\EntityManager;
use Espo\Core\Utils\Config;
use Espo\Core\Utils\Log;

class EarlyActionSync
{
    private $entityManager;
    private $config;
    private $log;
    
    public function __construct()
    {
        // Dependencies will be injected manually
    }
    
    public function inject(string $name, $object): void
    {
        switch ($name) {
            case 'entityManager':
                $this->entityManager = $object;
                break;
            case 'config':
                $this->config = $object;
                break;
            case 'log':
                $this->log = $object;
                break;
        }
    }
    
    /**
     * Convert ISO 8601 datetime to MySQL-compatible format
     */
    private function convertDateTime($isoDateTime)
    {
        if (empty($isoDateTime)) {
            return null;
        }
        
        try {
            // Parse ISO 8601 format (e.g., "2025-08-01T09:54:47.057Z")
            $dateTime = new \DateTime($isoDateTime);
            // Convert to MySQL datetime format
            return $dateTime->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            $this->log->error('IBF EarlyAction Sync: Failed to convert datetime: ' . $isoDateTime . ' - ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Sync early actions from IBF API for all enabled country/disaster type combinations
     */
    public function syncAllEarlyActions(): array
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
            $this->log->info('IBF EarlyAction Sync: Starting sync process');
            
            // Get enabled countries and disaster types from settings
            $enabledCountries = $this->config->get('ibfEnabledCountries', []);
            $enabledDisasterTypes = $this->config->get('ibfDisasterTypes', []);
            
            if (empty($enabledCountries) || empty($enabledDisasterTypes)) {
                $results['success'] = false;
                $results['message'] = 'No enabled countries or disaster types configured';
                $this->log->warning('IBF EarlyAction Sync: No enabled countries or disaster types configured');
                return $results;
            }
            
            $this->log->info('IBF EarlyAction Sync: Processing ' . count($enabledCountries) . ' countries and ' . count($enabledDisasterTypes) . ' disaster types');
            
            // Get IBF credentials for API access
            $ibfToken = $this->getSystemIBFToken();
            if (!$ibfToken) {
                $results['success'] = false;
                $results['message'] = 'Could not obtain IBF API token';
                $this->log->error('IBF EarlyAction Sync: Could not obtain IBF API token');
                return $results;
            }
            
            // Process each country/disaster type combination
            foreach ($enabledCountries as $countryCode) {
                foreach ($enabledDisasterTypes as $disasterType) {
                    try {
                        $syncResult = $this->syncEarlyActionsForCountryAndDisaster($countryCode, $disasterType, $ibfToken);
                        $results['processed']++;
                        $results['created'] += $syncResult['created'];
                        $results['updated'] += $syncResult['updated'];
                        
                        if (!$syncResult['success']) {
                            $results['errors'][] = "Failed for {$countryCode}/{$disasterType}: " . $syncResult['message'];
                        }
                    } catch (\Exception $e) {
                        $results['errors'][] = "Exception for {$countryCode}/{$disasterType}: " . $e->getMessage();
                        $this->log->error('IBF EarlyAction Sync: Exception for ' . $countryCode . '/' . $disasterType . ': ' . $e->getMessage());
                    }
                }
            }
            
            $results['message'] = "Processed {$results['processed']} combinations. Created: {$results['created']}, Updated: {$results['updated']}, Errors: " . count($results['errors']);
            $this->log->info('IBF EarlyAction Sync: ' . $results['message']);
            
        } catch (\Exception $e) {
            $results['success'] = false;
            $results['message'] = 'Sync failed: ' . $e->getMessage();
            $this->log->error('IBF EarlyAction Sync: Exception in syncAllEarlyActions: ' . $e->getMessage());
        }
        
        return $results;
    }
    
    /**
     * Sync early actions for a specific country and disaster type
     */
    private function syncEarlyActionsForCountryAndDisaster(string $countryCode, string $disasterType, string $ibfToken): array
    {
        $result = [
            'success' => true,
            'message' => '',
            'created' => 0,
            'updated' => 0
        ];
        
        try {
            $this->log->debug("IBF EarlyAction Sync: Fetching data for {$countryCode}/{$disasterType}");
            
            // Make API call to IBF backend
            $events = $this->fetchAlertAreasFromIBF($countryCode, $disasterType, $ibfToken);
            
            if (!$events || !is_array($events)) {
                $result['message'] = 'No events returned from API';
                return $result;
            }
            
            $this->log->debug("IBF EarlyAction Sync: Processing " . count($events) . " events for {$countryCode}/{$disasterType}");
            
            // Process each event
            foreach ($events as $event) {
                // First, sync the early warning event itself
                $earlyWarning = $this->syncEarlyWarning($event, $countryCode, $disasterType);
                
                if (!isset($event['alertAreas']) || !is_array($event['alertAreas'])) {
                    continue;
                }
                
                // Process each alert area within the event
                foreach ($event['alertAreas'] as $alertArea) {
                    if (!isset($alertArea['eapActions']) || !is_array($alertArea['eapActions'])) {
                        continue;
                    }
                    
                    foreach ($alertArea['eapActions'] as $eapAction) {
                        // Add event context to the early action
                        $eapAction['eventName'] = $event['eventName'] ?? null;
                        $eapAction['firstIssuedDate'] = $this->convertDateTime($event['firstIssuedDate'] ?? null);
                        $eapAction['endDate'] = $this->convertDateTime($event['endDate'] ?? null);
                        $eapAction['forecastTrigger'] = $event['forecastTrigger'] ?? false;
                        $eapAction['userTrigger'] = $event['userTrigger'] ?? false;
                        $eapAction['earlyWarningId'] = $earlyWarning ? $earlyWarning->getId() : null;
                        
                        $syncResult = $this->syncSingleEarlyAction($eapAction, $countryCode);
                        if ($syncResult['created']) {
                            $result['created']++;
                        } elseif ($syncResult['updated']) {
                            $result['updated']++;
                        }
                    }
                }
            }
            
            $result['message'] = "Created: {$result['created']}, Updated: {$result['updated']}";
            
        } catch (\Exception $e) {
            $result['success'] = false;
            $result['message'] = $e->getMessage();
            $this->log->error("IBF EarlyAction Sync: Exception for {$countryCode}/{$disasterType}: " . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Sync a single early action record
     */
    private function syncSingleEarlyAction(array $eapAction, string $countryCode): array
    {
        $result = ['created' => false, 'updated' => false];
        
        try {
            // Generate unique identifier for this early action
            $uniqueKey = $this->generateEarlyActionKey($eapAction);
            $dataHash = md5(json_encode($eapAction));
            
            // Check if record already exists
            $existingAction = $this->entityManager->getRepository('EarlyAction')
                ->where([
                    'action' => $eapAction['action'],
                    'placeCode' => $eapAction['placeCode'],
                    'disasterType' => $eapAction['disasterType']
                ])
                ->findOne();
            
            if ($existingAction) {
                // Update if data has changed
                if ($existingAction->get('ibfDataHash') !== $dataHash) {
                    $this->updateEarlyActionFromData($existingAction, $eapAction, $countryCode, $dataHash);
                    $this->entityManager->saveEntity($existingAction);
                    $result['updated'] = true;
                    $this->log->debug("IBF EarlyAction Sync: Updated action {$eapAction['action']} for {$eapAction['placeCode']}");
                }
            } else {
                // Create new record
                $newAction = $this->entityManager->getNewEntity('EarlyAction');
                $this->updateEarlyActionFromData($newAction, $eapAction, $countryCode, $dataHash);
                $this->entityManager->saveEntity($newAction);
                $result['created'] = true;
                $this->log->debug("IBF EarlyAction Sync: Created action {$eapAction['action']} for {$eapAction['placeCode']}");
            }
            
        } catch (\Exception $e) {
            $this->log->error("IBF EarlyAction Sync: Exception syncing action {$eapAction['action']}: " . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Update an EarlyAction entity with data from IBF API
     */
    private function updateEarlyActionFromData($entity, array $eapAction, string $countryCode, string $dataHash): void
    {
        $entity->set('name', $eapAction['label'] ?? 'Unnamed Action');
        $entity->set('aof', $eapAction['aof'] ?? '');
        $entity->set('action', $eapAction['action'] ?? '');
        $entity->set('label', $eapAction['label'] ?? '');
        $entity->set('disasterType', $eapAction['disasterType'] ?? '');
        $entity->set('placeCode', $eapAction['placeCode'] ?? '');
        $entity->set('countryId', $countryCode);
        $entity->set('countryName', $this->getCountryName($countryCode));
        $entity->set('checked', $eapAction['checked'] ?? false);
        $entity->set('month', $eapAction['month'] ?? null);
        
        // New fields from event data
        $entity->set('eventName', $eapAction['eventName'] ?? null);
        $entity->set('firstIssuedDate', $eapAction['firstIssuedDate'] ?? null);
        $entity->set('endDate', $eapAction['endDate'] ?? null);
        $entity->set('forecastTrigger', $eapAction['forecastTrigger'] ?? false);
        $entity->set('userTrigger', $eapAction['userTrigger'] ?? false);
        $entity->set('earlyWarningId', $eapAction['earlyWarningId'] ?? null);
        
        // Set the relationship link to the EarlyWarning entity
        if (!empty($eapAction['earlyWarningId'])) {
            $entity->set('earlyWarningId', $eapAction['earlyWarningId']);
        }
        
        $entity->set('ibfDataHash', $dataHash);
        $entity->set('lastSyncDate', date('Y-m-d H:i:s'));
        
        // Set default status if not provided
        if (!$entity->get('status')) {
            $entity->set('status', 'pending');
        }
    }
    
    /**
     * Sync an early warning event record
     */
    private function syncEarlyWarning(array $event, string $countryCode, string $disasterType): ?object
    {
        try {
            $eventName = $event['eventName'] ?? '';
            $dataHash = md5(json_encode($event));
            
            // Check if record already exists
            $existingWarning = $this->entityManager->getRepository('EarlyWarning')
                ->where([
                    'eventName' => $eventName,
                    'countryCodeISO3' => $countryCode,
                    'disasterType' => $disasterType
                ])
                ->findOne();
            
            if ($existingWarning) {
                // Update if data has changed
                if ($existingWarning->get('ibfDataHash') !== $dataHash) {
                    $this->updateEarlyWarningFromData($existingWarning, $event, $countryCode, $disasterType, $dataHash);
                    $this->entityManager->saveEntity($existingWarning);
                    $this->log->debug("IBF EarlyAction Sync: Updated early warning {$eventName} for {$countryCode}");
                }
                return $existingWarning;
            } else {
                // Create new record
                $newWarning = $this->entityManager->getNewEntity('EarlyWarning');
                $this->updateEarlyWarningFromData($newWarning, $event, $countryCode, $disasterType, $dataHash);
                $this->entityManager->saveEntity($newWarning);
                $this->log->debug("IBF EarlyAction Sync: Created early warning {$eventName} for {$countryCode}");
                return $newWarning;
            }
        } catch (\Exception $e) {
            $this->log->error("IBF EarlyAction Sync: Exception syncing early warning: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Update an EarlyWarning entity with data from IBF API
     */
    private function updateEarlyWarningFromData($entity, array $event, string $countryCode, string $disasterType, string $dataHash): void
    {
        $entity->set('name', $event['eventName'] ?? 'Unnamed Event');
        $entity->set('eventName', $event['eventName'] ?? '');
        $entity->set('countryCodeISO3', $countryCode);
        $entity->set('countryName', $this->getCountryName($countryCode));
        $entity->set('disasterType', $disasterType);
        $entity->set('firstIssuedDate', $this->convertDateTime($event['firstIssuedDate'] ?? null));
        $entity->set('endDate', $this->convertDateTime($event['endDate'] ?? null));
        $entity->set('forecastSeverity', $event['forecastSeverity'] ?? null);
        $entity->set('forecastTrigger', $event['forecastTrigger'] ?? false);
        $entity->set('userTrigger', $event['userTrigger'] ?? false);
        $entity->set('userTriggerDate', $this->convertDateTime($event['userTriggerDate'] ?? null));
        $entity->set('userTriggerName', $event['userTriggerName'] ?? null);
        $entity->set('ibfDataHash', $dataHash);
        $entity->set('lastSyncDate', date('Y-m-d H:i:s'));
        
        // Set status based on end date
        $endDateConverted = $this->convertDateTime($event['endDate'] ?? null);
        if ($endDateConverted && strtotime($endDateConverted) < time()) {
            $entity->set('status', 'ended');
        } else {
            $entity->set('status', 'active');
        }
    }
    
    /**
     * Generate a unique key for an early action
     */
    private function generateEarlyActionKey(array $eapAction): string
    {
        return sprintf('%s_%s_%s', 
            $eapAction['action'] ?? 'unknown',
            $eapAction['placeCode'] ?? 'unknown', 
            $eapAction['disasterType'] ?? 'unknown'
        );
    }
    
    /**
     * Get country name from country code
     */
    private function getCountryName(string $countryCode): string
    {
        $countryNames = [
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
        
        return $countryNames[$countryCode] ?? $countryCode;
    }
    
    /**
     * Fetch alert areas from IBF API
     */
    /**
     * Fetch events data from IBF API
     */
    private function fetchAlertAreasFromIBF(string $countryCodeIso3, string $disasterType, string $ibfToken): ?array
    {
        try {
            $ibfApiUrl = $this->config->get('ibfBackendApiUrl', 'https://ibf-test.510.global/api');
            $url = rtrim($ibfApiUrl, '/') . '/event/' . $countryCodeIso3 . '/' . $disasterType;
            
            $this->log->debug("IBF EarlyAction Sync: Making request to: " . $url);
            
            // Initialize cURL
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 60,  // Increased timeout for large responses
                CURLOPT_CONNECTTIMEOUT => 30,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $ibfToken,
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 3,
                CURLOPT_USERAGENT => 'IBF-EspoCRM-Sync/1.0',
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_TCP_KEEPALIVE => 1,
                CURLOPT_FRESH_CONNECT => false,
                CURLOPT_FORBID_REUSE => false
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($curlError) {
                $this->log->error("IBF EarlyAction Sync: cURL error: " . $curlError);
                return null;
            }
            
            if ($httpCode !== 200) {
                $this->log->error("IBF EarlyAction Sync: HTTP error {$httpCode} for {$countryCodeIso3}/{$disasterType}");
                return null;
            }
            
            $data = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->log->error("IBF EarlyAction Sync: JSON decode error: " . json_last_error_msg());
                return null;
            }
            
            return $data;
            
        } catch (\Exception $e) {
            $this->log->error("IBF EarlyAction Sync: Exception fetching from IBF: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get system IBF token for API access
     */
    private function getSystemIBFToken(): ?string
    {
        try {
            // Get the first admin user's IBF credentials for system operations
            $adminUser = $this->entityManager->getRepository('User')
                ->where(['type' => 'admin', 'isActive' => true])
                ->findOne();
                
            if (!$adminUser) {
                $this->log->error("IBF EarlyAction Sync: No admin user found for system token");
                return null;
            }
            
            // Get IBFUser record for this admin
            $ibfUser = $this->entityManager->getRepository('IBFUser')
                ->where(['userId' => $adminUser->getId()])
                ->findOne();
                
            if (!$ibfUser) {
                $this->log->error("IBF EarlyAction Sync: No IBFUser record found for admin");
                return null;
            }
            
            $ibfEmail = $ibfUser->get('email');
            $ibfPassword = $ibfUser->get('password');
            
            if (!$ibfEmail || !$ibfPassword) {
                $this->log->error("IBF EarlyAction Sync: Admin IBFUser missing credentials");
                return null;
            }
            
            return $this->loginIbfUserAndGetToken($ibfEmail, $ibfPassword);
            
        } catch (\Exception $e) {
            $this->log->error("IBF EarlyAction Sync: Exception getting system token: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Login to IBF and get authentication token
     */
    private function loginIbfUserAndGetToken(string $email, string $password): ?string
    {
        try {
            $ibfApiUrl = $this->config->get('ibfBackendApiUrl', 'https://ibf-test.510.global/api');
            $loginUrl = rtrim($ibfApiUrl, '/') . '/user/login';
            
            $loginData = [
                'email' => $email,
                'password' => $password
            ];
            
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $loginUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($loginData),
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                CURLOPT_SSL_VERIFYPEER => true
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($curlError) {
                $this->log->error("IBF EarlyAction Sync: Login cURL error: " . $curlError);
                return null;
            }
            
            if ($httpCode !== 201) {
                $this->log->error("IBF EarlyAction Sync: Login failed with HTTP {$httpCode}");
                return null;
            }
            
            $responseData = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->log->error("IBF EarlyAction Sync: Login response JSON error: " . json_last_error_msg());
                return null;
            }
            
            return $responseData['user']['token'] ?? null;
            
        } catch (\Exception $e) {
            $this->log->error("IBF EarlyAction Sync: Exception during login: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Manual trigger for sync (can be called from admin interface)
     */
    public function manualSync(): array
    {
        $this->log->info('IBF EarlyAction Sync: Manual sync triggered');
        return $this->syncAllEarlyActions();
    }
}
