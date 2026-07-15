// IconKit para Angular (standalone). Uso: <ik-icon name="home" mode="solid" size="20"></ik-icon>
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IK_ICONS, IK_WRAP } from './iconkit.data';

@Component({
  selector: 'ik-icon',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="solid ? color : 'none'" [attr.stroke]="solid ? 'none' : color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" [innerHTML]="svg"></svg>`,
})
export class IkIconComponent {
  @Input() name = '';
  @Input() mode: 'outline' | 'solid' = 'outline';
  @Input() size: number | string = 24;
  @Input() color = 'currentColor';
  constructor(private s: DomSanitizer) {}
  get rec() { return IK_ICONS[this.name]; }
  get solid() { return this.mode === 'solid' && !!this.rec?.[1]; }
  get svg(): SafeHtml { const r = this.rec; return this.s.bypassSecurityTrustHtml(r ? (this.solid ? r[1]! : r[0]) : ''); }
}
