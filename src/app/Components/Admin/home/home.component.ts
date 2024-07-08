import { Component } from '@angular/core';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { CommonService } from 'src/app/Services/Common/common.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(public userService: AuthService, private commonService: CommonService) { }

  // on load event //
  ngOnInit() {
    this.commonService.scrollToTop();
  }
}
