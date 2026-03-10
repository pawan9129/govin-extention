import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Meetingcreate } from './meetingcreate';

describe('Meetingcreate', () => {
  let component: Meetingcreate;
  let fixture: ComponentFixture<Meetingcreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Meetingcreate],
    }).compileComponents();

    fixture = TestBed.createComponent(Meetingcreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
