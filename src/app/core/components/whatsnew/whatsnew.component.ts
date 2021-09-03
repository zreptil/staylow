import {Component, OnInit} from '@angular/core';
import {SessionService} from '@/_services/session.service';
import {ScoreData} from '@/_models/score-data';

@Component({
  selector: 'app-whatsnew',
  templateUrl: './whatsnew.component.html',
  styleUrls: ['./whatsnew.component.scss']
})
export class WhatsnewComponent implements OnInit {

  public scores: ScoreData;
  public winners: { name: string, score: number }[];

  constructor(public ss: SessionService) {
  }

  ngOnInit(): void {
    const scores = this.ss.scores[this.ss.getScoreKey()];
    this.winners = [];
    Object.keys(scores.winners).forEach(key => {
      this.winners.push({name: key, score: scores.winners[key]});
    });
    this.winners.sort((a, b) => {
      return b.score - a.score;
    });
  }

}
