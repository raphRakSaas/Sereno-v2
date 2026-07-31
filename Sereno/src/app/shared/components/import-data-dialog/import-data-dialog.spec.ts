import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportDataDialog } from './import-data-dialog';

describe('ImportDataDialog', () => {
  let fixture: ComponentFixture<ImportDataDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportDataDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportDataDialog);
    fixture.componentRef.setInput('fileName', 'sereno-export.json');
    fixture.componentRef.setInput('summary', {
      mode: 'merge',
      categories: 12,
      transactions: 24,
      budgets: 5,
      goals: 2,
      recurrences: 3,
    });
    fixture.detectChanges();
  });

  it('should render merge and replace import options', () => {
    expect(fixture.nativeElement.textContent).toContain('Fusionner');
    expect(fixture.nativeElement.textContent).toContain('Remplacer');
    expect(fixture.nativeElement.textContent).toContain('3 récurrences');
  });

  it('should emit the selected import mode on confirm', () => {
    const confirmedModes: string[] = [];
    fixture.componentInstance.confirmed.subscribe((mode) => confirmedModes.push(mode));

    const replaceLabel = [...fixture.nativeElement.querySelectorAll('label')].find(
      (element: Element) => element.textContent?.includes('Remplacer'),
    ) as HTMLLabelElement;

    const replaceInput = replaceLabel.querySelector('input') as HTMLInputElement;
    replaceInput.checked = true;
    replaceInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    fixture.componentInstance['selectedMode'].set('replace');
    fixture.detectChanges();

    const confirmButton = [...fixture.nativeElement.querySelectorAll('button')].find(
      (element: Element) => element.textContent?.trim() === 'Importer',
    ) as HTMLButtonElement;

    confirmButton.click();

    expect(confirmedModes).toEqual(['replace']);
  });
});
