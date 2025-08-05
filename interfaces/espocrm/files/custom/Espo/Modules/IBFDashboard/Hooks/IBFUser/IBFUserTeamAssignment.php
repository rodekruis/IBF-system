<?php

namespace Espo\Modules\IBFDashboard\Hooks\IBFUser;

use Espo\Core\Hook\Hook\AfterSave;
use Espo\ORM\Entity;
use Espo\ORM\Repository\Option\SaveOptions;

class IBFUserTeamAssignment implements AfterSave
{
    private $entityManager;
    private $log;

    public function __construct($entityManager, $log)
    {
        $this->entityManager = $entityManager;
        $this->log = $log;
    }

    /**
     * After an IBFUser is created, automatically add them to the Anticipatory Action team
     */
    public function afterSave(Entity $entity, SaveOptions $options): void
    {
        // Only process new entities
        if (!$entity->isNew()) {
            return;
        }

        $userId = $entity->get('userId');
        if (!$userId) {
            $this->log->warning("IBF Dashboard: IBFUser created without userId: " . $entity->get('id'));
            return;
        }

        try {
            // Get the Anticipatory Action team
            $anticipationTeam = $this->entityManager->getRepository('Team')
                ->where(['name' => 'Anticipatory Action'])
                ->findOne();
                
            if (!$anticipationTeam) {
                $this->log->error("IBF Dashboard: Anticipatory Action team not found when creating IBFUser for user {$userId}");
                return;
            }

            // Check if user is already in the team
            $existingTeamUser = $this->entityManager->getRepository('TeamUser')
                ->where([
                    'teamId' => $anticipationTeam->get('id'),
                    'userId' => $userId
                ])
                ->findOne();
                
            if ($existingTeamUser) {
                $this->log->info("IBF Dashboard: User {$userId} already in Anticipatory Action team");
                return;
            }

            // Add user to the Anticipatory Action team
            $teamUser = $this->entityManager->createEntity('TeamUser', [
                'teamId' => $anticipationTeam->get('id'),
                'userId' => $userId
            ]);

            if ($teamUser) {
                $this->log->info("IBF Dashboard: Added user {$userId} to Anticipatory Action team after IBFUser creation");
            } else {
                $this->log->error("IBF Dashboard: Failed to add user {$userId} to Anticipatory Action team");
            }
            
        } catch (\Exception $e) {
            $this->log->error("IBF Dashboard: Exception adding user {$userId} to team: " . $e->getMessage());
        }
    }
}
