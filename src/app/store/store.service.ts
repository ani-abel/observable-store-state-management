import { Injectable } from '@angular/core';
import { ObservableStore } from '@codewithdan/observable-store';
import { HttpClient } from "@angular/common/http";
import { catchError, map, tap } from "rxjs/operators";
import { Observable, of } from 'rxjs';


export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface StoreState {
  Questions: TriviaQuestion[];
  CurrentQuestion: TriviaQuestion;
  Username: string;
  IsLoading: boolean;
  ActiveError: Error;
}

// const InitialAppState: StoreState = {
//   Questions: [],
//   CurrentQuestion: undefined,
//   IsLoading: false,
//   Username: undefined,
// }

export enum ActionType {
  GET_QUESTION_ACTION = "[ACTION] GET_QUESTIONS_ACTION",
  ADD_QUESTION_ACTION = "[ACTION] ADD_QUESTION_ACTION",
  IS_LOADING_ACTION = "[ACTION] IS_LOADING_ACTION",
  ERROR_FOUND_ACTION = "[ACTION] ERROR_FOUND_ACTION"
}

@Injectable({
  providedIn: 'root'
})
export class StoreService extends ObservableStore<StoreState> {

  constructor(private readonly httpClient: HttpClient) {
    super({
      trackStateHistory: true,
      logStateChanges: true
    });
  }

  private fetchQuestions() {
    return this.httpClient.get<any>("https://opentdb.com/api.php?amount=10")
            .pipe(
              tap(() => {
                this.setState({ IsLoading: true }, ActionType.IS_LOADING_ACTION)
              }),
              map((data) => {
                this.setState({ Questions: data.results, IsLoading: false }, ActionType.GET_QUESTION_ACTION)
                return data.results;
              }),
              catchError((error: Error) => of(error),
            )
        )
  }

  getAllQuestions() {
    //First try to get data from cache, if not found make a http call
    const state = this.getState();
    if(state?.Questions) {
      return of(state.Questions);
    }
    else {
        return this.fetchQuestions().pipe(
          catchError((error: Error) => of(error)
        )
      );
    }
  }

  private handleError(error: any) {
    console.error({ serverError: error });
    if(error.error instanceof Error) {
      const { message } = error.error;
      this.setState({ IsLoading: false, ActiveError: error.error }, ActionType.ERROR_FOUND_ACTION);
      return Observable.throw(message);
    }
    const errorObj: any = new Error(error || "Server Error");
    this.setState({ IsLoading: false, ActiveError: errorObj }, ActionType.ERROR_FOUND_ACTION)
    return Observable.throw(error || "Server Error");
  }
}
