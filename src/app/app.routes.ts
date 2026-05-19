import { Routes } from "@angular/router";
import { PokedexPageComponent } from "./features/pokedex/pokedex-page.component";
import { TeamBuilderPageComponent } from "./features/team-builder/team-builder-page.component";
import { BattlesPageComponent } from "./features/battles/battles-page.component";
import { ProfilePageComponent } from "./features/profile/profile-page.component";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "pokedex" },
  { path: "pokedex", component: PokedexPageComponent },
  { path: "team-builder", component: TeamBuilderPageComponent },
  { path: "battles", component: BattlesPageComponent },
  { path: "profile", component: ProfilePageComponent },
  { path: "**", redirectTo: "pokedex" },
];
