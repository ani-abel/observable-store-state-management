import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from "rxjs/operators";
import { TriviaQuestion, StoreService } from '../store/store.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit, OnDestroy {
  triviaQuestions$: Observable<TriviaQuestion[]>;
  getQuestions: Subscription;

  constructor(private readonly store: StoreService) { }

  ngOnInit(): void {
    this.getQuestions =
    this.store.getAllQuestions().subscribe();

    /**
     * Tracks the state changes for only this field in this project
     */
    this.triviaQuestions$ = this.store.stateChanged.pipe(
      /**
       * Pick a value from the store
       */
      map(state => state?.Questions)
    );

    /**
     * Tracks the state changes for this field and for all global state fields in this project
     */
    // this.triviaQuestions$ = this.store.globalStateChanged.pipe(
    //   /**
    //    * Pick a value from the store
    //    */
    //   map(state => state?.Questions)
    // );
  }

  ngOnDestroy(): void {
    this.getQuestions.unsubscribe();
  }

}
