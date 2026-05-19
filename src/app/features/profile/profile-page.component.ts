import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";

/**
 * Profile route shell.
 * Trainer selection + profile editing are implemented in later passes.
 */
@Component({
  selector: "app-profile-page",
  standalone: true,
  imports: [MatCardModule],
  templateUrl: "./profile-page.component.html",
  styleUrl: "./profile-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {}

