/*
 * FILEPATH: /D:/Studies/ALX SE/Portfolio/Pop-Quiz/db.sql
 *
 * This SQL script creates a database schema for a Pop Quiz application. It defines several tables to store information related to users, categories, quizzes, questions, options, user responses, and user points.
 *
 * Table: Users
 * - UserID: INT (Primary Key, Auto Increment) - Unique identifier for each user.
 * - Username: VARCHAR(50) - User's username.
 * - Email: VARCHAR(100) - User's email address.
 * - UserType: ENUM('Admin', 'Educator', 'Student') - User's role type.
 * - ProfilePhoto: VARCHAR(255) - Path to user's profile photo.
 *
 * Table: Categories
 * - CategoryID: INT (Primary Key, Auto Increment) - Unique identifier for each category.
 * - CategoryName: VARCHAR(50) - Name of the category.
 * - ProfilePhoto: VARCHAR(255) - Path to category's profile photo.
 *
 * Table: Quizzes
 * - QuizID: INT (Primary Key, Auto Increment) - Unique identifier for each quiz.
 * - Title: VARCHAR(100) - Title of the quiz.
 * - Description: TEXT - Description of the quiz.
 * - Instructions: TEXT - Instructions for the quiz.
 * - CreatedBy: INT - User ID of the quiz creator.
 * - TimeAlloted: INT - Time allotted for the quiz in minutes.
 * - AllowCorrection: BOOLEAN - Flag indicating whether correction is allowed for the quiz.
 * - AllowSharing: BOOLEAN - Flag indicating whether sharing is allowed for the quiz.
 * - MaxAttempts: INT - Maximum number of attempts allowed for the quiz.
 * - QuizDate: DATE - Date of the quiz.
 * - CategoryID: INT - Category ID to which the quiz belongs.
 * - PreviewPhoto: VARCHAR(255) - Path to quiz's preview photo (optional).
 *
 * Table: Questions
 * - QuestionID: INT (Primary Key, Auto Increment) - Unique identifier for each question.
 * - QuestionText: TEXT - Text of the question.
 * - QuizID: INT - Quiz ID to which the question belongs.
 *
 * Table: QuizLinks
 * - LinkID: INT (Primary Key, Auto Increment) - Unique identifier for each quiz link.
 * - QuizID: INT - Quiz ID to which the link belongs.
 * - UniqueLink: VARCHAR(255) - Unique link for the quiz.
 *
 * Table: Options
 * - OptionID: INT (Primary Key, Auto Increment) - Unique identifier for each option.
 * - OptionText: VARCHAR(100) - Text of the option.
 * - QuestionID: INT - Question ID to which the option belongs.
 * - IsCorrect: BOOLEAN - Flag indicating whether the option is correct.
 *
 * Table: UserResponses
 * - ResponseID: INT (Primary Key, Auto Increment) - Unique identifier for each user response.
 * - UserID: INT - User ID of the respondent.
 * - QuizID: INT - Quiz ID to which the response belongs.
 * - QuestionID: INT - Question ID to which the response belongs.
 * - OptionID: INT - Option ID selected by the user.
 * - IsCorrect: BIT(1) - Flag indicating whether the response is correct.
 *
 * Table: UserPoints
 * - UserPointID: INT (Primary Key, Auto Increment) - Unique identifier for each user point.
 * - UserID: INT - User ID of the user.
 * - QuizID: INT - Quiz ID to which the points belong.
 * - Points: INT - Points earned by the user for the quiz.
 *
 */
-- Table to store Users
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    UserType ENUM('Admin', 'Educator', 'Student') NOT NULL,
    ProfilePhoto VARCHAR(255), -- Path to profile photo
    QuizPassed INT NOT NULL DEFAULT 0 -- Initialize QuizPassed with 0
);

-- Table to store Categories
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY AUTO_INCREMENT,
    CategoryName VARCHAR(50) NOT NULL
    ProfilePhoto VARCHAR(255) -- Path to profile photo

);

-- Table to store Quizzes
CREATE TABLE Quizzes (
    QuizID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(100) NOT NULL,
    Description TEXT,
    Instructions TEXT,
    CreatedBy INT,
    TimeAlloted INT, -- in minutes
    AllowCorrection BOOLEAN,
    AllowSharing BOOLEAN,
    MaxAttempts INT,
    QuizDate DATE,
    CategoryID INT,
    PreviewPhoto VARCHAR(255), -- Path to preview photo (optional)
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Table to store Questions
CREATE TABLE Questions (
    QuestionID INT PRIMARY KEY AUTO_INCREMENT,
    QuestionText TEXT NOT NULL,
    QuizID INT,
    FOREIGN KEY (QuizID) REFERENCES Quizzes(QuizID)
);

-- Table to store Quiz Links
CREATE TABLE QuizLinks (
    LinkID INT PRIMARY KEY AUTO_INCREMENT,
    QuizID INT,
    UniqueLink VARCHAR(255) NOT NULL,
    FOREIGN KEY (QuizID) REFERENCES Quizzes(QuizID)
);

-- Table to store Options for Multiple Choice Questions
CREATE TABLE Options (
    OptionID INT PRIMARY KEY AUTO_INCREMENT,
    OptionText VARCHAR(100) NOT NULL,
    QuestionID INT,
    IsCorrect BOOLEAN,
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID)
);

-- Table to store User Responses to Quizzes
CREATE TABLE UserResponses (
    ResponseID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    QuizID INT,
    QuestionID INT,
    OptionID INT,
    IsCorrect BIT(1),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (QuizID) REFERENCES Quizzes(QuizID),
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID),
    FOREIGN KEY (OptionID) REFERENCES Options(OptionID),
    INDEX idx_UserResponses_UserID (UserID),
    INDEX idx_UserResponses_QuizID (QuizID),
    INDEX idx_UserResponses_QuestionID (QuestionID),
    INDEX idx_UserResponses_OptionID (OptionID)
);

-- Table to store User Points
CREATE TABLE UserPoints (
    UserPointID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    QuizID INT,
    Points INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (QuizID) REFERENCES Quizzes(QuizID)
);
-- How to proceed with firebase

-- Here's how you might structure your data in Firebase:

-- 1. Users: This could be a collection where each document represents a user. The document ID could be the UserID, and the document fields could be Username, Email, UserType, and ProfilePhoto.

-- 2. Categories: This could be a collection where each document represents a category. The document ID could be the CategoryID, and the document fields could be CategoryName and ProfilePhoto.

-- 3. Quizzes: This could be a collection where each document represents a quiz. The document ID could be the QuizID, and the document fields could be Title, Description, Instructions, CreatedBy, TimeAlloted, AllowCorrection, AllowSharing, MaxAttempts, QuizDate, CategoryID, and PreviewPhoto.

-- 4. Questions: This could be a sub-collection within each Quiz document. Each document in this sub-collection represents a question. The document ID could be the QuestionID, and the document fields could be QuestionText.

-- 5. QuizLinks: This could be a sub-collection within each Quiz document. Each document in this sub-collection represents a unique link. The document ID could be the LinkID, and the document fields could be UniqueLink.

-- 6. Options: This could be a sub-collection within each Question document. Each document in this sub-collection represents an option. The document ID could be the OptionID, and the document fields could be OptionText and IsCorrect.

-- 7. UserResponses: This could be a collection where each document represents a user response. The document ID could be the ResponseID, and the document fields could be UserID, QuizID, QuestionID, OptionID, and IsCorrect.

-- 8. UserPoints: This could be a collection where each document represents a user point. The document ID could be the UserPointID, and the document fields could be UserID, QuizID, and Points.

-- Remember, Firebase is a NoSQL database, so it doesn't enforce relationships between collections like SQL databases do. You'll need to manage these relationships in your application code.
