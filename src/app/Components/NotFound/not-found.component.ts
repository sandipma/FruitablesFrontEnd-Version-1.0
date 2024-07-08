import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/Common/common.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {

  // constructor initialization //
constructor(private commonService :CommonService,
            private router :Router)
{
  this.commonService.getUserOrAdmin();
}

// on load event //
ngOnInit() {
 this.commonService.scrollToTop();
}

//Method for navigate to home based on user or admin flag //
navigateToHome()
{
  if(this.commonService.isUserOrAdmin === 'admin')
  {
    this.router.navigate(['/admin-portal']);
  }
  else
  {
    this.router.navigate(['/']);
  }
}
}
