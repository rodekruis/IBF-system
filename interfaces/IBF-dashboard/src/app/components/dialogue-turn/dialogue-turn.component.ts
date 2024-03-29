import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Actor } from '../../types/chat';

@Component({
  selector: 'app-dialogue-turn',
  templateUrl: './dialogue-turn.component.html',
  styleUrls: ['./dialogue-turn.component.scss'],
})
export class DialogueTurnComponent implements OnInit {
  @Input()
  isSpoken = false;

  @Input()
  actor = Actor.system;

  @Input()
  timestamp: DateTime;

  @Input()
  isConnected = false;

  @Input()
  isWarn = false;

  @Input()
  isStopped = false;

  @Input()
  isTriggered = false;

  @Input()
  isNotTriggered = false;

  @Input()
  isSelected = true;

  @Input()
  isOpeningBubble = false;

  isSelf: boolean;
  isSystem: boolean;

  public allActors = Actor;

  animate = false;

  ngOnInit() {
    this.isSelf = this.actor === Actor.self;
    this.isSystem = this.actor === Actor.system;
  }

  show() {
    this.isSpoken = true;
  }
}
