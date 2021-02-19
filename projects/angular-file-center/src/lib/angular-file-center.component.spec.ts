import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularFileCenterComponent } from './angular-file-center.component';

describe('AngularFileCenterComponent', () => {
  let component: AngularFileCenterComponent;
  let fixture: ComponentFixture<AngularFileCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AngularFileCenterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularFileCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
