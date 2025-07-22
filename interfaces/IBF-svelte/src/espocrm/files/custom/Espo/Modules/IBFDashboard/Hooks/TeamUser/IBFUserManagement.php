<?php

namespace Espo\Modules\IBFDashboard\Hooks\TeamUser;

use Espo\Core\Hook\Hook\BeforeRemove;
use Espo\Core\Hook\Hook\AfterSave;
use Espo\ORM\Entity;
use Espo\ORM\Repository\Option\SaveOptions;
use Espo\ORM\Repository\Option\RemoveOptions;

class IBFUserManagement implements AfterSave, BeforeRemove
{
    private $entityManager;
    private $log;

    public function __construct($entityManager, $log)
    {
        $this->entityManager = $entityManager;
        $this->log = $log;
    }

    /**
     * After a user is added to a team, create IBFUser if it's the Anticipatory Action team
     */
    public function afterSave(Entity $entity, SaveOptions $options): void
    {
        // Get the team this user was added to
        $teamId = $entity->get('teamId');
        $userId = $entity->get('userId');
        
        if (!$teamId || !$userId) {
            return;
        }

        // Check if this is the Anticipatory Action team
        $team = $this->entityManager->getEntityById('Team', $teamId);
        if (!$team || $team->get('name') !== 'Anticipatory Action') {
            return;
        }

        // Check if IBFUser already exists for this user
        $existingIBFUser = $this->entityManager->getRepository('IBFUser')
            ->where(['userId' => $userId])
            ->findOne();
            
        if ($existingIBFUser) {
            $this->log->info("IBF Dashboard: IBFUser already exists for user {$userId}");
            return;
        }

        // Get the user entity
        $user = $this->entityManager->getEntityById('User', $userId);
        if (!$user) {
            $this->log->error("IBF Dashboard: Could not find user {$userId}");
            return;
        }

        try {
            // Create IBFUser record
            $ibfUser = $this->entityManager->createEntity('IBFUser', [
                'userId' => $userId,
                'email' => $user->get('emailAddress'), // Use EspoCRM email as default
                'password' => '', // Will need to be set by admin
                'allowedCountries' => ['ETH', 'UGA', 'ZMB', 'KEN'], // Default countries
                'allowedDisasterTypes' => ['drought', 'floods', 'heavy-rainfall'], // Default disaster types
                'isActive' => true,
                'autoCreated' => true
            ]);

            $this->log->info("IBF Dashboard: Created IBFUser for user {$userId} (team: {$team->get('name')})");
            
        } catch (\Exception $e) {
            $this->log->error("IBF Dashboard: Failed to create IBFUser for user {$userId}: " . $e->getMessage());
        }
    }

    /**
     * Before a user is removed from a team, delete IBFUser if it's the Anticipatory Action team
     */
    public function beforeRemove(Entity $entity, RemoveOptions $options): void
    {
        // Get the team this user is being removed from
        $teamId = $entity->get('teamId');
        $userId = $entity->get('userId');
        
        if (!$teamId || !$userId) {
            return;
        }

        // Check if this is the Anticipatory Action team
        $team = $this->entityManager->getEntityById('Team', $teamId);
        if (!$team || $team->get('name') !== 'Anticipatory Action') {
            return;
        }

        // Find and delete the corresponding IBFUser
        $ibfUser = $this->entityManager->getRepository('IBFUser')
            ->where(['userId' => $userId])
            ->findOne();
            
        if ($ibfUser) {
            try {
                $this->entityManager->removeEntity($ibfUser);
                $this->log->info("IBF Dashboard: Deleted IBFUser for user {$userId} (removed from team: {$team->get('name')})");
                
            } catch (\Exception $e) {
                $this->log->error("IBF Dashboard: Failed to delete IBFUser for user {$userId}: " . $e->getMessage());
            }
        }
    }
}
