import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BreedItemComponent } from './breed-item.component';
import { BreedsService } from '@/app/services/breeds/breeds.service';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BREED_SUB_BREED_SEPARATOR } from '@/app/constants/keys';

describe('BreedItemComponent', () => {
  let component: BreedItemComponent;
  let fixture: ComponentFixture<BreedItemComponent>;
  let mockBreedsService: jasmine.SpyObj<BreedsService>;

  const mockSrc =
    'https://images.dog.ceo/breeds/retriever-golden/random-name-123.jpg';

  beforeEach(async () => {
    // Create a spy object for BreedsService
    mockBreedsService = jasmine.createSpyObj('BreedsService', [], {
      likedBreeds: signal<string[]>([]),
    });

    await TestBed.configureTestingModule({
      imports: [BreedItemComponent],
      providers: [{ provide: BreedsService, useValue: mockBreedsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BreedItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('src', mockSrc);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Breed name computation', () => {
    it('should extract breed name correctly from src URL', () => {
      expect(component.name()).toBe(
        `retriever${BREED_SUB_BREED_SEPARATOR}golden`,
      );
    });

    it('should handle invalid src URLs gracefully', () => {
      fixture.componentRef.setInput('src', 'invalid-url');
      fixture.detectChanges();
      expect(component.name()).toBe('');
    });
  });

  describe('Like functionality', () => {
    it('should emit correct like event with status', () => {
      const likeSpy = spyOn(component.like, 'emit');
      const likeButton = fixture.debugElement.query(By.css('.btn-like'));

      likeButton.nativeElement.click();

      expect(likeSpy).toHaveBeenCalledWith({
        name: `retriever${BREED_SUB_BREED_SEPARATOR}golden`,
        src: mockSrc,
        isLiked: false,
      });
    });

    it('should show processing state when liking', fakeAsync(() => {
      const likeButton = fixture.debugElement.query(By.css('.btn-like'));

      likeButton.nativeElement.click();
      expect(component.isProcessing()).toBeTrue();

      tick(0);
      expect(component.isProcessing()).toBeFalse();
    }));

    it('should reflect liked state based on BreedsService', () => {
      // Update the mock service's signal
      mockBreedsService.likedBreeds.set([mockSrc]);
      fixture.detectChanges();

      expect(component.isLiked()).toBeTrue();
      const likeButton = fixture.debugElement.query(By.css('.btn-like'));
      expect(likeButton.nativeElement.classList.contains('liked')).toBeTrue();
    });
  });

  describe('Keyboard accessibility', () => {
    it('should handle Enter key press for main image', () => {
      const pressSpy = spyOn(component.press, 'emit');
      const img = fixture.debugElement.query(By.css('picture'));

      img.triggerEventHandler('keydown', { key: 'Enter' });

      expect(pressSpy).toHaveBeenCalledWith({
        name: `retriever${BREED_SUB_BREED_SEPARATOR}golden`,
        src: mockSrc,
      });
    });

    it('should not trigger actions on non-Enter key press', () => {
      const pressSpy = spyOn(component.press, 'emit');
      const img = fixture.debugElement.query(By.css('picture'));

      img.triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Space' }),
      );

      expect(pressSpy).not.toHaveBeenCalled();
    });
  });

  describe('Search functionality', () => {
    it('should show search button only when canSearch is true', () => {
      fixture.componentRef.setInput('canSearch', false);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.btn-search'))).toBeNull();

      fixture.componentRef.setInput('canSearch', true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.btn-search'))).toBeTruthy();
    });

    it('should emit explore event when search button is clicked', () => {
      fixture.componentRef.setInput('canSearch', true);
      fixture.detectChanges();

      const exploreSpy = spyOn(component.explore, 'emit');
      const searchButton = fixture.debugElement.query(By.css('.btn-search'));

      searchButton.nativeElement.click();

      expect(exploreSpy).toHaveBeenCalledWith({
        name: `retriever${BREED_SUB_BREED_SEPARATOR}golden`,
        src: mockSrc,
      });
    });
  });

  describe('Download functionality', () => {
    it('should prevent event propagation when downloading', () => {
      const downloadButton = fixture.debugElement.query(
        By.css('.btn-download'),
      );
      const event = new MouseEvent('click');
      const stopPropagationSpy = spyOn(event, 'stopPropagation');

      downloadButton.triggerEventHandler('click', event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should emit download event with correct breed info', () => {
      const downloadSpy = spyOn(component.download, 'emit');
      const downloadButton = fixture.debugElement.query(
        By.css('.btn-download'),
      );

      downloadButton.nativeElement.click();

      expect(downloadSpy).toHaveBeenCalledWith({
        name: `retriever${BREED_SUB_BREED_SEPARATOR}golden`,
        src: mockSrc,
      });
    });
  });
});
