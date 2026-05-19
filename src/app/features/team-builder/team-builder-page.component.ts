import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";

/**
 * Team Builder route shell.
 * The full advanced form + drag/drop bonus are implemented in later passes.
 */
@Component({
  selector: "app-team-builder-page",
  standalone: true,
  imports: [MatCardModule],
  templateUrl: "./team-builder-page.component.html",
  styleUrl: "./team-builder-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBuilderPageComponent {}

