import { Injectable, inject } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { map, Observable } from "rxjs";
import { Battle, BattleLogEntry, Team, Trainer } from "./models";

const GET_TRAINERS = gql`
  query GetTrainers {
    allTrainers(sortField: "id", sortOrder: "ASC") {
      id
      name
      badge_count
      region
      avatar_url
      rank
    }
  }
`;

const GET_TRAINER = gql`
  query GetTrainer($id: ID!) {
    Trainer(id: $id) {
      id
      name
      badge_count
      region
      avatar_url
      rank
    }
  }
`;

const GET_TEAMS = gql`
  query GetTeams($trainerId: ID!) {
    allTeams(filter: { trainer_id: $trainerId }, sortField: "created_at", sortOrder: "DESC") {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

const GET_BATTLES = gql`
  query GetBattles($trainerId: ID!) {
    allBattles(filter: { trainer_id: $trainerId }, sortField: "date", sortOrder: "DESC") {
      id
      trainer_id
      opponent_name
      team_id
      result
      date
      score_trainer
      score_opponent
    }
  }
`;

const GET_BATTLE_LOGS = gql`
  query GetBattleLogs {
    allBattleLogs(sortField: "timestamp", sortOrder: "ASC") {
      id
      battle_id
      timestamp
      message
      severity
    }
  }
`;

const CREATE_TEAM = gql`
  mutation CreateTeam($data: TeamInput!) {
    createTeam(data: $data) {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

const UPDATE_TEAM = gql`
  mutation UpdateTeam($id: ID!, $data: TeamInput!) {
    updateTeam(id: $id, data: $data) {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

const DELETE_TEAM = gql`
  mutation DeleteTeam($id: ID!) {
    deleteTeam(id: $id)
  }
`;

const UPDATE_TRAINER = gql`
  mutation UpdateTrainer($id: ID!, $data: TrainerInput!) {
    updateTrainer(id: $id, data: $data) {
      id
      name
      badge_count
      region
      avatar_url
      rank
    }
  }
`;

const LOG_BATTLE = gql`
  mutation CreateBattle($data: BattleInput!) {
    createBattle(data: $data) {
      id
      trainer_id
      opponent_name
      team_id
      result
      date
      score_trainer
      score_opponent
    }
  }
`;

/**
 * GraphQL API wrapper for the local mock server (json-graphql-server).
 * Provides queries + mutations for trainer profile, teams, battles and battle logs.
 */
@Injectable({ providedIn: "root" })
export class TrainerApiService {
  private readonly apollo = inject(Apollo).use("local");

  /**
   * Fetches all trainers.
   *
   * @returns Observable<Trainer[]> - Stream of trainers
   */
  public getTrainers(): Observable<Trainer[]> {
    return this.apollo
      .query<{ allTrainers: Trainer[] }>({ query: GET_TRAINERS, fetchPolicy: "network-only" })
      .pipe(map((res) => this.requireData(res.data, "GetTrainers").allTrainers));
  }

  /**
   * Fetches a trainer profile by id.
   *
   * @param id - Trainer id
   * @returns Observable<Trainer> - Stream of the trainer profile
   */
  public getTrainer(id: number): Observable<Trainer> {
    return this.apollo
      .query<{ Trainer: Trainer }>({
        query: GET_TRAINER,
        variables: { id: String(id) },
        fetchPolicy: "network-only",
      })
      .pipe(map((res) => this.requireData(res.data, "GetTrainer").Trainer));
  }

  /**
   * Fetches teams belonging to a trainer.
   *
   * @param trainerId - Trainer id
   * @returns Observable<Team[]> - Stream of trainer teams
   */
  public getTeams(trainerId: number): Observable<Team[]> {
    return this.apollo
      .query<{ allTeams: Team[] }>({
        query: GET_TEAMS,
        variables: { trainerId: String(trainerId) },
        fetchPolicy: "network-only",
      })
      .pipe(map((res) => this.requireData(res.data, "GetTeams").allTeams));
  }

  /**
   * Fetches battles belonging to a trainer.
   *
   * @param trainerId - Trainer id
   * @returns Observable<Battle[]> - Stream of trainer battles
   */
  public getBattles(trainerId: number): Observable<Battle[]> {
    return this.apollo
      .query<{ allBattles: Battle[] }>({
        query: GET_BATTLES,
        variables: { trainerId: String(trainerId) },
        fetchPolicy: "network-only",
      })
      .pipe(map((res) => this.requireData(res.data, "GetBattles").allBattles));
  }

  /**
   * Fetches all battle logs (across battles). Used by the simulated subscription feed.
   *
   * @returns Observable<BattleLogEntry[]> - Stream of all battle logs
   */
  public getBattleLogs(): Observable<BattleLogEntry[]> {
    return this.apollo
      .query<{ allBattleLogs: BattleLogEntry[] }>({
        query: GET_BATTLE_LOGS,
        fetchPolicy: "network-only",
      })
      .pipe(map((res) => this.requireData(res.data, "GetBattleLogs").allBattleLogs));
  }

  /**
   * Creates a new team.
   *
   * @param data - Partial team input (trainer_id, name, pokemon_ids, created_at)
   * @returns Observable<Team> - Stream of the created team
   */
  public createTeam(data: Omit<Team, "id">): Observable<Team> {
    return this.apollo
      .mutate<{ createTeam: Team }>({
        mutation: CREATE_TEAM,
        variables: { data },
      })
      .pipe(map((res) => this.requireData(res.data, "CreateTeam").createTeam));
  }

  /**
   * Updates a team by id.
   *
   * @param id - Team id
   * @param data - Team patch
   * @returns Observable<Team> - Stream of updated team
   */
  public updateTeam(id: number, data: Partial<Omit<Team, "id">>): Observable<Team> {
    return this.apollo
      .mutate<{ updateTeam: Team }>({
        mutation: UPDATE_TEAM,
        variables: { id: String(id), data },
      })
      .pipe(map((res) => this.requireData(res.data, "UpdateTeam").updateTeam));
  }

  /**
   * Deletes a team by id.
   *
   * @param id - Team id
   * @returns Observable<boolean> - Stream of deletion success
   */
  public deleteTeam(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteTeam: boolean }>({
        mutation: DELETE_TEAM,
        variables: { id: String(id) },
      })
      .pipe(map((res) => !!res.data?.deleteTeam));
  }

  /**
   * Updates trainer profile fields.
   *
   * @param id - Trainer id
   * @param data - Trainer patch
   * @returns Observable<Trainer> - Stream of updated trainer
   */
  public updateTrainer(id: number, data: Partial<Omit<Trainer, "id">>): Observable<Trainer> {
    return this.apollo
      .mutate<{ updateTrainer: Trainer }>({
        mutation: UPDATE_TRAINER,
        variables: { id: String(id), data },
      })
      .pipe(map((res) => this.requireData(res.data, "UpdateTrainer").updateTrainer));
  }

  /**
   * Logs (creates) a new battle result.
   *
   * @param data - Battle input (excluding id)
   * @returns Observable<Battle> - Stream of created battle
   */
  public logBattle(data: Omit<Battle, "id">): Observable<Battle> {
    return this.apollo
      .mutate<{ createBattle: Battle }>({
        mutation: LOG_BATTLE,
        variables: { data },
      })
      .pipe(map((res) => this.requireData(res.data, "CreateBattle").createBattle));
  }

  /**
   * Requires GraphQL response data and converts empty responses into explicit errors.
   *
   * @param data - Possibly empty GraphQL data payload
   * @param operation - Operation name for diagnostics
   * @returns Non-null GraphQL data payload
   */
  private requireData<T>(data: T | null | undefined, operation: string): T {
    if (!data) {
      throw new Error(`${operation} returned no data`);
    }

    return data;
  }
}
