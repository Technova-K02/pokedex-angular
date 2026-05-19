import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject, combineLatest, map, startWith } from "rxjs";
import { PokemonStore } from "../../state/pokemon.store";
import { pokemonSearchResults$ } from "../../state/pokemon.selectors";
import { totalBaseStats } from "../../api/pokeapi.util";

/**
 * Pokédex route shell.
 * Full table/grid, filtering, selection, and detail panel are implemented in later passes.
 */
@Component({
  selector: "app-pokedex-page",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./pokedex-page.component.html",
  styleUrl: "./pokedex-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexPageComponent {
  private readonly store = inject(PokemonStore);
  private readonly destroyRef = inject(DestroyRef);

  public readonly searchControl = new FormControl<string>("", { nonNullable: true });

  private readonly limit = 50;
  private readonly offsetSubject = new BehaviorSubject<number>(0);

  public readonly state = toSignal(this.store.state$, { initialValue: this.store.getSnapshot() });
  public readonly pokemonList$ = this.store.selectPokemonList();

  public readonly searchResults$ = pokemonSearchResults$(
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
    this.pokemonList$,
  );

  public readonly visiblePokemon = toSignal(this.searchResults$, { initialValue: [] });

  public readonly loading = computed(() => this.state().loadingList || this.state().loadingTypes);
  public readonly error = computed(() => this.state().error);

  /**
   * Loads the next page of Pokemon into the cache.
   */
  public loadMore(): void {
    const offset = this.offsetSubject.getValue();
    this.store.loadPokemonPage(this.limit, offset).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.offsetSubject.next(offset + this.limit);
  }

  /**
   * Computes total base stats for a Pokemon row.
   *
   * @param stats - Pokemon stats array
   * @returns Total base stats
   */
  public total(stats: { base_stat: number }[]): number {
    return totalBaseStats(stats as any);
  }
}

