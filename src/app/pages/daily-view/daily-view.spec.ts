import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyView } from './daily-view';

describe('DailyView', () => {
  let component: DailyView;
  let fixture: ComponentFixture<DailyView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
