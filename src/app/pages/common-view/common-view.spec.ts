import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonView } from './common-view';

describe('CommonView', () => {
  let component: CommonView;
  let fixture: ComponentFixture<CommonView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
