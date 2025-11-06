import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigWeek } from './config-week';

describe('ConfigWeek', () => {
  let component: ConfigWeek;
  let fixture: ComponentFixture<ConfigWeek>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigWeek]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigWeek);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
