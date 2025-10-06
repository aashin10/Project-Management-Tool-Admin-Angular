import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  color: string;
}

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-members.html',
  styleUrl: './team-members.css'
})
export class TeamMembersComponent {

    constructor(
    private router: Router,
  ) {}
  @Input() teamMembers: TeamMember[] = [];
  @Input() showViewAll: boolean = true;
 @Output() viewAllClicked = new EventEmitter<void>();
 
  onViewAll() {
    this.viewAllClicked.emit(); // notify parent component
  }

  getColorClasses(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  }
}