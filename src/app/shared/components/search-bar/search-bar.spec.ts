import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBar } from './search-bar';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, SearchBar],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render default placeholder', () => {
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.placeholder).toBe('Search...');
  });

  it('should render custom placeholder', () => {
    component.placeholder = 'Find something...';
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.placeholder).toBe('Find something...');
  });

  it('should update searchQuery and emit events on input', () => {
    spyOn(component.search, 'emit');
    spyOn(component.searchChange, 'emit');

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.value = 'test query';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.searchQuery).toBe('test query');
    expect(component.search.emit).toHaveBeenCalledWith('test query');
    expect(component.searchChange.emit).toHaveBeenCalledWith('test query');
  });
});
