import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyView } from './weekly-view';

describe('WeeklyView', () => {
  let component: WeeklyView;
  let fixture: ComponentFixture<WeeklyView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
