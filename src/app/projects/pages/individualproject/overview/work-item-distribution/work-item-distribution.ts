import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface WorkItemDistributionItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-work-item-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-item-distribution.html',
  styleUrl: './work-item-distribution.css'
})
export class WorkItemDistributionComponent {
  @Input() workItemDistribution: WorkItemDistributionItem[] = [];
  @Input() totalItems: number = 0;

  hoveredSegment: number = -1;

  setHoveredSegment(index: number): void {
    this.hoveredSegment = index;
  }

  getStrokeDasharray(percentage: number): string {
    const circumference = 2 * Math.PI * 85; // radius = 85
    const segmentLength = (percentage / 100) * circumference;
    const gapLength = circumference - segmentLength;
    return `${segmentLength} ${gapLength}`;
  }

  getStrokeDashoffset(previousPercentages: number): number {
    const circumference = 2 * Math.PI * 85;
    return -((previousPercentages / 100) * circumference);
  }

  getTooltipPosition(): { x: number; y: number } {
    if (this.hoveredSegment === -1) {
      return { x: 0, y: 0 };
    }

    const radius = 85;
    const centerX = 120;
    const centerY = 120;
    
    // Calculate the middle angle of the hovered segment
    let previousPercentage = 0;
    for (let i = 0; i < this.hoveredSegment; i++) {
      if (i === 2) previousPercentage = this.workItemDistribution[2].percentage;
      if (i === 1) previousPercentage += this.workItemDistribution[1].percentage;
    }
    
    const currentPercentage = this.workItemDistribution[this.hoveredSegment].percentage;
    const middlePercentage = previousPercentage + (currentPercentage / 2);
    
    // Convert percentage to angle (starting from top, going clockwise)
    const angle = (middlePercentage / 100) * 2 * Math.PI - (Math.PI / 2);
    
    // Calculate tooltip position at the outer edge of the segment
    const tooltipDistance = radius + 35; // Distance from center
    const x = centerX + Math.cos(angle) * tooltipDistance;
    const y = centerY + Math.sin(angle) * tooltipDistance;
    
    return { x, y };
  }
}