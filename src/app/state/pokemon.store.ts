import { DestroyRef, Injectable, inject } from "@angular/core";
import { BehaviorSubject, catchError, finalize, map, Observable, of, tap } from "rxjs";
import { PokemonApiService, TypeEfficacyRow } from "../api/pokemon-api.service";
import { PokemonDetails, PokemonListItem } from "../api/models";

export interface PokemonState {
  pokemonById: Record<number, PokemonListItem>;
  pokemonIds: number[];
  detailsById: Record<number, PokemonDetails>;
  typeEfficacies: TypeEfficacyRow[] | null;
  loadingList: boolean;
  loadingDetails: boolean;
  loadingTypes: boolean;
  error: string | null;
}

const INITIAL_STATE: PokemonState = {
  pokemonById: {},
  pokemonIds: [],
  detailsById: {},
  typeEfficacies: null,
  loadingList: false,
  loadingDetails: false,
  loadingTypes: false,
  error: null,
};

/**
 * BehaviorSubject-based store for Pokemon cache and related metadata.
 * This store intentionally avoids NgRx/Akita/NgXS per assessment constraints.
 */
@Injectable({ providedIn: "root" })
export class PokemonStore {
  private readonly api = inject(PokemonApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly stateSubject = new BehaviorSubject<PokemonState>(INITIAL_STATE);

  /**
   * Observable stream of the entire PokemonState.
   */
  public readonly state$ = this.stateSubject.asObservable();

  /**
   * Returns the current snapshot value of the store (read-only usage).
   *
   * @returns PokemonState
   */
  public getSnapshot(): PokemonState {
    return this.stateSubject.getValue();
  }

  /**
   * Loads a paginated list of Pokemon and merges them into the cache.
   *
   * @param limit - Page size
   * @param offset - Page offset
   * @returns Observable<PokemonListItem[]> - Stream of fetched items
   */
  public loadPokemonPage(limit: number, offset: number): Observable<PokemonListItem[]> {
    this.patchState({ loadingList: true, error: null });

    return this.api.getPokemonPage(limit, offset).pipe(
      tap((items) => {
        const current = this.getSnapshot();
        const nextById = { ...current.pokemonById };
        const nextIds = new Set(current.pokemonIds);

        for (const item of items) {
          nextById[item.id] = item;
          nextIds.add(item.id);
        }

        this.patchState({
          pokemonById: nextById,
          pokemonIds: Array.from(nextIds).sort((a, b) => a - b),
        });
      }),
      finalize(() => this.patchState({ loadingList: false })),
      catchError((err) => {
        this.patchState({ error: this.toErrorMessage(err) });
        return of([]);
      }),
    );
  }

  /**
   * Loads and caches a single Pokemon details object.
   *
   * @param id - Pokemon id
   * @returns Observable<PokemonDetails> - Stream of details
   */
  public loadPokemonDetails(id: number): Observable<PokemonDetails> {
    const cached = this.getSnapshot().detailsById[id];
    if (cached) {
      return of(cached);
    }

    this.patchState({ loadingDetails: true, error: null });
    return this.api.getPokemonDetails(id).pipe(
      tap((details) => {
        const current = this.getSnapshot();
        this.patchState({
          detailsById: { ...current.detailsById, [id]: details },
          pokemonById: { ...current.pokemonById, [id]: details },
          pokemonIds: current.pokemonIds.includes(id)
            ? current.pokemonIds
            : [...current.pokemonIds, id].sort((a, b) => a - b),
        });
      }),
      finalize(() => this.patchState({ loadingDetails: false })),
      catchError((err) => {
        this.patchState({ error: this.toErrorMessage(err) });
        return of(null as unknown as PokemonDetails);
      }),
    );
  }

  /**
   * Loads type efficacy rows for matchup calculations.
   *
   * @returns Observable<TypeEfficacyRow[]> - Stream of efficacy rows
   */
  public loadTypeEfficacies(): Observable<TypeEfficacyRow[]> {
    const cached = this.getSnapshot().typeEfficacies;
    if (cached) {
      return of(cached);
    }

    this.patchState({ loadingTypes: true, error: null });
    return this.api.getTypeEfficacies().pipe(
      tap((rows) => this.patchState({ typeEfficacies: rows })),
      finalize(() => this.patchState({ loadingTypes: false })),
      catchError((err) => {
        this.patchState({ error: this.toErrorMessage(err) });
        return of([]);
      }),
    );
  }

  /**
   * Selector-ish helper to get the current cached Pokemon list, in id order.
   *
   * @returns Observable<PokemonListItem[]>
   */
  public selectPokemonList(): Observable<PokemonListItem[]> {
    return this.state$.pipe(
      map((s) => s.pokemonIds.map((id) => s.pokemonById[id]).filter(Boolean)),
    );
  }

  /**
   * Patches the store state.
   *
   * @param patch - Partial state patch
   */
  private patchState(patch: Partial<PokemonState>): void {
    this.stateSubject.next({ ...this.stateSubject.getValue(), ...patch });
  }

  /**
   * Converts unknown errors into a user-friendly message.
   *
   * @param err - Unknown error
   * @returns String message
   */
  private toErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    return "Unknown error";
  }
}

