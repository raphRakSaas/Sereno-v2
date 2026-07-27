import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CategoryCreate } from './category-create';
import { AppStore } from '../../core/store/app.store';

const addCategory = vi.fn().mockResolvedValue({ id: 'cat-custom' });

describe('CategoryCreate (integration)', () => {
  beforeEach(async () => {
    addCategory.mockClear();
    await TestBed.configureTestingModule({
      imports: [CategoryCreate],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: { addCategory } },
      ],
    }).compileComponents();
  });

  it('should render category creation form with icon and color pickers', () => {
    const fixture = TestBed.createComponent(CategoryCreate);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Nouvelle catégorie');
    expect(element.textContent).toContain('Icône');
    expect(element.textContent).toContain('Couleur');
  });

  it('should require a category name before submit', async () => {
    const fixture = TestBed.createComponent(CategoryCreate);
    fixture.detectChanges();
    await fixture.componentInstance['onSubmit']();
    expect(addCategory).not.toHaveBeenCalled();
  });
});
