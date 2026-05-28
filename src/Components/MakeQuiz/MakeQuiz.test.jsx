import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import MakeQuiz from './MakeQuiz';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { NavigationProvider } from '../../contexts/NavigationContext';
import * as firestoreService from '../../services/firestoreService';

// Mock Firebase auth
jest.mock('../../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123' }
  }
}));

// Mock Firestore service
jest.mock('../../services/firestoreService');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  Plus: () => <div>Plus</div>,
  Trash2: () => <div>Trash2</div>,
  ChevronLeft: () => <div>ChevronLeft</div>,
  ChevronRight: () => <div>ChevronRight</div>,
  Lock: () => <div>Lock</div>,
  Globe: () => <div>Globe</div>,
  Image: () => <div>Image</div>,
  Star: () => <div>Star</div>
}));

const mockCategories = [
  { id: 'cat-1', name: 'Medicine', slug: 'medicine', image: 'medicine.jpg' },
  { id: 'cat-2', name: 'Agriculture', slug: 'agriculture', image: 'agriculture.jpg' },
  { id: 'cat-3', name: 'Technology', slug: 'technology', image: 'technology.jpg' }
];

const renderWithProviders = (component, route = '/makequiz') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <NotificationProvider>
        <NavigationProvider>
          {component}
        </NavigationProvider>
      </NotificationProvider>
    </MemoryRouter>
  );
};

describe('MakeQuiz - Phase 1: Quiz Basics', () => {
  beforeEach(() => {
    // Mock successful category fetch
    firestoreService.getCategories.mockResolvedValue({
      success: true,
      data: mockCategories
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Validation', () => {
    test('should show validation error when title is empty', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Try to click Next without filling title
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Quiz title is required')).toBeInTheDocument();
      });
    });

    test('should show validation error when category is not selected', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Fill title but not category
      const titleInput = screen.getByPlaceholderText(/e.g., Cardiology Essentials/i);
      fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });

      // Try to click Next
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a category')).toBeInTheDocument();
      });
    });

    test('should show validation error when description is empty', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Fill title but not description
      const titleInput = screen.getByPlaceholderText(/e.g., Cardiology Essentials/i);
      fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });

      // Try to click Next
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Summary and instructions are required')).toBeInTheDocument();
      });
    });

    test('should enforce 120 character limit on description', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      const descriptionTextarea = screen.getByPlaceholderText(/Provide clear instructions/i);
      const longText = 'a'.repeat(150);

      fireEvent.change(descriptionTextarea, { target: { value: longText } });

      // Should only accept 120 characters
      expect(descriptionTextarea.value.length).toBe(120);
      expect(screen.getByText('120/120')).toBeInTheDocument();
    });

    test('should show character counter for description', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      const descriptionTextarea = screen.getByPlaceholderText(/Provide clear instructions/i);

      fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });

      expect(screen.getByText(/16\/120/)).toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    test('should reject files larger than 500KB', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Create a mock file larger than 500KB
      const largeFile = new File(['a'.repeat(600000)], 'large-image.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/Upload/i).querySelector('input[type="file"]');

      Object.defineProperty(fileInput, 'files', {
        value: [largeFile]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('Image size must be less than 500KB')).toBeInTheDocument();
      });
    });

    test('should accept files smaller than 500KB', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Create a mock file smaller than 500KB
      const smallFile = new File(['a'.repeat(100000)], 'small-image.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/Upload/i).querySelector('input[type="file"]');

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onloadend: null,
        result: 'data:image/jpeg;base64,mockdata'
      };

      global.FileReader = jest.fn(() => mockFileReader);

      Object.defineProperty(fileInput, 'files', {
        value: [smallFile]
      });

      fireEvent.change(fileInput);

      // Trigger FileReader callback
      mockFileReader.onloadend();

      // Should not show error
      expect(screen.queryByText('Image size must be less than 500KB')).not.toBeInTheDocument();
    });
  });

  describe('Category Auto-Population', () => {
    test('should auto-populate category from URL', async () => {
      firestoreService.getCategoryById.mockResolvedValue({
        success: true,
        data: mockCategories[0]
      });

      renderWithProviders(<MakeQuiz />, '/makequiz?categoryId=cat-1');

      await waitFor(() => {
        expect(firestoreService.getCategoryById).toHaveBeenCalledWith('cat-1');
      });

      // Category should be pre-selected
      await waitFor(() => {
        const categoryButton = screen.getByText('Medicine');
        expect(categoryButton).toBeInTheDocument();
      });
    });

    test('should work without category URL parameter', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Select a category...')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Protection', () => {
    test('should NOT show modal when form is empty', async () => {
      const { container } = renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Try to navigate back with empty form
      const backButton = screen.getByLabelText(/ArrowLeft/i);
      fireEvent.click(backButton);

      // Modal should NOT appear
      expect(screen.queryByText('Discard Changes?')).not.toBeInTheDocument();
    });

    test('should show modal when form has data and user clicks back', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Fill in title
      const titleInput = screen.getByPlaceholderText(/e.g., Cardiology Essentials/i);
      fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });

      // Try to navigate back
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Discard Changes?')).toBeInTheDocument();
      });
    });

    test('should show modal when form has description data', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Fill in description
      const descriptionTextarea = screen.getByPlaceholderText(/Provide clear instructions/i);
      fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });

      // Try to navigate back
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Discard Changes?')).toBeInTheDocument();
      });
    });

    test('should show modal when cover image is uploaded', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Enter cover image URL
      const imageInput = screen.getByPlaceholderText(/Paste image address/i);
      fireEvent.change(imageInput, { target: { value: 'https://example.com/image.jpg' } });

      // Try to navigate back
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Discard Changes?')).toBeInTheDocument();
      });
    });

    test('should trigger beforeunload when leaving page with data', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Fill in title
      const titleInput = screen.getByPlaceholderText(/e.g., Cardiology Essentials/i);
      fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });

      // Simulate beforeunload event
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);

      // Event should be prevented
      expect(beforeUnloadEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Category Dropdown', () => {
    test('should show 2 categories at once in dropdown', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Open category dropdown
      const categoryButton = screen.getByText('Select a category...');
      fireEvent.click(categoryButton);

      await waitFor(() => {
        expect(screen.getByText('Medicine')).toBeInTheDocument();
        expect(screen.getByText('Agriculture')).toBeInTheDocument();
      });

      // Check max-height is 108px (2 items)
      const dropdownList = screen.getByText('Medicine').closest('div[style*="maxHeight"]');
      expect(dropdownList).toHaveStyle({ maxHeight: '108px' });
    });

    test('should filter categories based on search', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Open category dropdown
      const categoryButton = screen.getByText('Select a category...');
      fireEvent.click(categoryButton);

      // Type in search
      const searchInput = screen.getByPlaceholderText('Search categories...');
      fireEvent.change(searchInput, { target: { value: 'Tech' } });

      await waitFor(() => {
        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.queryByText('Medicine')).not.toBeInTheDocument();
      });
    });

    test('should show "no results" message when no categories match', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      // Open category dropdown
      const categoryButton = screen.getByText('Select a category...');
      fireEvent.click(categoryButton);

      // Type search that won't match
      const searchInput = screen.getByPlaceholderText('Search categories...');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      await waitFor(() => {
        expect(screen.getByText(/No categories found matching "NonExistent"/)).toBeInTheDocument();
      });
    });
  });

  describe('Status Badge', () => {
    test('should show Draft badge for new quiz', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('✏️')).toBeInTheDocument();
        expect(screen.getByText('Draft')).toBeInTheDocument();
      });
    });

    test('should show Revision badge when editing published quiz', async () => {
      firestoreService.getQuizById.mockResolvedValue({
        success: true,
        data: {
          id: 'quiz-1',
          title: 'Existing Quiz',
          description: 'Test description',
          isDraft: false,
          isPublic: true,
          questions: []
        }
      });

      renderWithProviders(<MakeQuiz />, '/makequiz?quizId=quiz-1');

      await waitFor(() => {
        expect(screen.getByText('🔄')).toBeInTheDocument();
        expect(screen.getByText('Revision')).toBeInTheDocument();
      });
    });
  });

  describe('Tooltip Interactions', () => {
    test('should show cover image tooltip on hover', async () => {
      renderWithProviders(<MakeQuiz />);

      await waitFor(() => {
        expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
      });

      const infoIcon = screen.getByText('Cover Image').nextSibling;
      fireEvent.mouseEnter(infoIcon);

      await waitFor(() => {
        expect(screen.getByText(/1200 × 630 pixels/)).toBeInTheDocument();
      });

      fireEvent.mouseLeave(infoIcon);

      await waitFor(() => {
        expect(screen.queryByText(/1200 × 630 pixels/)).not.toBeVisible();
      });
    });
  });
});
