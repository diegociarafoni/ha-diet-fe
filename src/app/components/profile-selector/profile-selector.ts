import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DietService } from '../../services/diet';

@Component({
  selector: 'app-profile-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-selector.html',
  styleUrls: ['./profile-selector.scss']
})
export class ProfileSelector {
  constructor(private diet: DietService) {}

  get caps$() { return this.diet.capabilitiesObservable(); }
  get active$() { return this.diet.activeProfileObservable(); }

  async change(profile_id: string) {
    const pid = profile_id ? Number(profile_id) : null;
    try {
      await this.diet.setActiveProfile(pid);
    } catch (err) {
      console.error('Impossibile cambiare profilo', err);
    }
  }
}
