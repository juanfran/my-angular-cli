import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai'

import { addComponent } from './index';

const expect = chai.expect;
chai.use(sinonChai);

describe('Ast', () => {
  describe.only('add component', () => {
    it('add component in inline declaration', () => {
      const file = `import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [ AppComponent, ExammpleComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;

      const fileExpected = `import { TestComponent } from '../component1/testcomponent';
import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [ AppComponent, ExammpleComponent, TestComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;

      const resultText = addComponent(file, 'TestComponent', '../component1/testcomponent');

      console.log(resultText);

      expect(resultText).to.be.equal(fileExpected);
    });

    it('add component in inline declaration with trailing comma', () => {
      const file = `import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [ AppComponent, ExammpleComponent, ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;

      const fileExpected = `import { TestComponent } from '../component1/testcomponent';
import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [ AppComponent, ExammpleComponent, TestComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;

      const resultText = addComponent(file, 'TestComponent', '../component1/testcomponent');

      expect(resultText).to.be.equal(fileExpected);
    });

    it('add component in multiline declaration', () => {
      const file = `import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [
    AppComponent,
    ExammpleComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;

      const fileExpected = `import { TestComponent } from '../component1/testcomponent';
import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [
    AppComponent,
    ExammpleComponent,
    TestComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;
    });

    it('add component in multiline declaration with trailing comma', () => {
      const file = `import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [
    AppComponent,
    ExammpleComponent,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;

      const fileExpected = `import { TestComponent } from '../component1/testcomponent';
import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [
    AppComponent,
    ExammpleComponent,
    TestComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;
    });

    it('add component without declarations', () => {
      const file = `import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;

      const fileExpected = `import { TestComponent } from '../component1/testcomponent';
import { NgModule }      from '@angular/core';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    TestModule
  ],
  declarations: [ TestComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }`;
    });
  });

});
