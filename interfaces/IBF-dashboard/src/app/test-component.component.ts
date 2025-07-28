import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <div style="padding: 20px; background: #e8f5e8; margin: 20px; border-radius: 8px;">
      <h2>✅ Test Component Loaded Successfully!</h2>
      <p>This confirms that routing is working in the web component context.</p>
      <p>Current time: {{ currentTime }}</p>
    </div>
  `,
  standalone: true,
})
export class TestComponent {
  currentTime = new Date().toLocaleTimeString();
}
