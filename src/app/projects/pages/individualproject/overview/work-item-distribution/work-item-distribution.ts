
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


    cumulativePercentage(index: number): number {
    return this.workItemDistribution
      .slice(index + 1)
      .reduce((acc, item) => acc + item.percentage, 0);
  }

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
    // Add gap: 1% of circumference per segment passed
    const gapSize = 0.0; // 0.8% gap between segments
    const gapsBeforeSegment = previousPercentages > 0 ? this.getSegmentCount(previousPercentages) : 0;
    const totalGap = gapsBeforeSegment * gapSize;
    return -(((previousPercentages + totalGap) / 100) * circumference);
  }

  private getSegmentCount(percentage: number): number {
    let count = 0;
    let total = 0;
    for (let item of this.workItemDistribution) {
      if (total >= percentage) break;
      total += item.percentage;
      count++;
    }
    return count;
  }

getTooltipPosition(): { x: number; y: number } {
  if (
    this.hoveredSegment < 0 || 
    this.hoveredSegment >= this.workItemDistribution.length
  ) {
    return { x: 0, y: 0 }; // safe default
  }

  const radius = 85;
  const centerX = 120;
  const centerY = 120;

  // Calculate cumulative percentage for previous segments
  const previousPercentage = this.workItemDistribution
    .slice(this.hoveredSegment + 1)
    .reduce((acc, item) => acc + item.percentage, 0);

  const currentPercentage = this.workItemDistribution[this.hoveredSegment].percentage;
  const middlePercentage = previousPercentage + currentPercentage / 2;

  // Convert percentage to angle
  const angle = (middlePercentage / 100) * 2 * Math.PI - Math.PI / 2;

  const tooltipDistance = radius + 45;
  const x = centerX + Math.cos(angle) * tooltipDistance;
  const y = centerY + Math.sin(angle) * tooltipDistance;

  return { x, y };
}

}