import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public readonly sidebarOpen = signal(true);

  public readonly navItems = computed(() => [
    { label: "Pokédex", icon: "catching_pokemon", route: "/pokedex" },
    { label: "Team Builder", icon: "groups", route: "/team-builder" },
    { label: "Battles", icon: "sports_martial_arts", route: "/battles" },
    { label: "Profile", icon: "person", route: "/profile" },
  ]);

  /**
   * Toggles the sidebar open state.
   */
  public toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
