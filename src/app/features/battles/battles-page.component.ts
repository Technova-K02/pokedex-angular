import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";

/**
 * Battles route shell.
 * Battle history + charts + live feed are implemented in later passes.
 */
@Component({
  selector: "app-battles-page",
  standalone: true,
  imports: [MatCardModule],
  templateUrl: "./battles-page.component.html",
  styleUrl: "./battles-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlesPageComponent {}

