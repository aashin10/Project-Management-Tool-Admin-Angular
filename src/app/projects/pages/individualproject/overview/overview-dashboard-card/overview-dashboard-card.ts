import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-overview-dashboard-card',
  imports: [],
  templateUrl: './overview-dashboard-card.html',
  styleUrl: './overview-dashboard-card.css'
})
export class OverviewDashboardCard {

  @Input() title!: string;
  @Input() value!: string | number;
  @Input() subtitle!: string;
  @Input() set icon(value: string) {
    this._icon = this.sanitizer.bypassSecurityTrustHtml(value);
  }

  private _icon!: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  get icon(): SafeHtml {
    return this._icon;
  }
}
