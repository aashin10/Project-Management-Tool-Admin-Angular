import { Component } from '@angular/core';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { Importprojectslist } from '../importprojectslist/importprojectslist';

@Component({
  selector: 'app-select-projects-section',
  imports: [CustomButton, SearchBar, Importprojectslist],
  templateUrl: './select-projects-section.html',
  styleUrl: './select-projects-section.css',
})
export class SelectProjectsSection {}
