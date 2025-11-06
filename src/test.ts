// Load Zone.js first (global) then the testing zone adapters for Angular's TestBed.
import 'zone.js/fesm2015/zone.js';
import 'zone.js/fesm2015/zone-testing.js';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Load all the test files
const context = (require as any).context('./', true, /\.spec\.ts$/);
context.keys().forEach(context);
