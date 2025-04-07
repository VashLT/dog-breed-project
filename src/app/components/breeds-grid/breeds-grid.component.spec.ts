import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreedsGridComponent } from './breeds-grid.component';
import { BreedsService } from '@/app/services/breeds/breeds.service';
import { signal } from '@angular/core';
import { FILTER_OPTIONS } from '@constants/misc';

describe('BreedsGridComponent', () => {
  let component: BreedsGridComponent;
  let fixture: ComponentFixture<BreedsGridComponent>;
  let breedsServiceMock: jasmine.SpyObj<BreedsService>;

  // Mock data
  const mockBreeds = [
    'https://images.dog.ceo/breeds/retriever-golden/random-name-123.jpg',
    'https://images.dog.ceo/breeds/retriever-golden/random-name-231.jpg',
    'https://images.dog.ceo/breeds/retriever-golden/random-name-132.jpg',
  ];
  const mockLikedBreeds = [
    'https://images.dog.ceo/breeds/retriever-golden/random-name-123.jpg',
  ];

  const mockBreedItem = {
    src: 'https://images.dog.ceo/breeds/retriever-golden/random-name-123.jpg',
    name: 'retriever-golden',
  };

  beforeEach(async () => {
    // Create spies for services
    breedsServiceMock = jasmine.createSpyObj(
      'BreedsService',
      ['addLikedBreed', 'removeLikedBreed', 'downloadSrc'],
      {
        search: signal(''),
        likedBreeds: signal(mockLikedBreeds),
        filter: signal(FILTER_OPTIONS[0]),
      },
    );

    // Configure default mock behavior

    await TestBed.configureTestingModule({
      imports: [BreedsGridComponent],
      providers: [{ provide: BreedsService, useValue: breedsServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(BreedsGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('breeds', mockBreeds);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showingBreeds', () => {
    it('should show all breeds when filter is not "liked"', () => {
      breedsServiceMock.filter.set(FILTER_OPTIONS[0]);
      fixture.detectChanges();
      expect(component.showingBreeds()).toEqual(mockBreeds);
    });

    it('should show only liked breeds when filter is "liked"', () => {
      breedsServiceMock.filter.set(FILTER_OPTIONS[1]);
      fixture.detectChanges();
      expect(component.showingBreeds()).toEqual(mockLikedBreeds);
    });
  });

  describe('onItemPress', () => {
    it('should open dialog with correct data', () => {
      spyOn(component.dialog, 'open');
      component.onItemPress(mockBreedItem);

      expect(component.dialog.open).toHaveBeenCalled();
    });
  });

  describe('onItemLike', () => {
    it('should remove breed from liked when already liked', () => {
      const mockLikeEmit = {
        src: 'https://images.dog.ceo/breeds/retriever-golden/random-name-123.jpg',
        name: 'retriever-golden',
        isLiked: true,
      };

      component.onItemLike(mockLikeEmit);

      expect(breedsServiceMock.removeLikedBreed).toHaveBeenCalledWith(
        mockBreedItem.src,
      );
      expect(breedsServiceMock.addLikedBreed).not.toHaveBeenCalled();
    });

    it('should add breed to liked when not liked', () => {
      const mockLikeEmit = {
        src: 'https://images.dog.ceo/breeds/retriever-golden/random-name-123.jpg',
        name: 'retriever-golden',
        isLiked: false,
      };

      component.onItemLike(mockLikeEmit);

      expect(breedsServiceMock.addLikedBreed).toHaveBeenCalledWith(
        mockBreedItem.src,
      );
      expect(breedsServiceMock.removeLikedBreed).not.toHaveBeenCalled();
    });
  });

  describe('onItemExplore', () => {
    it('should trigger search with breed name', () => {
      component.onItemExplore(mockBreedItem);

      expect(breedsServiceMock.search().value).toEqual(mockBreedItem.name);
    });
  });

  describe('onItemDownload', () => {
    it('should call downloadSrc with breed item', () => {
      component.onItemDownload(mockBreedItem);

      expect(breedsServiceMock.downloadSrc).toHaveBeenCalledWith(mockBreedItem);
    });
  });
});
