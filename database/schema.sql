CREATE DATABASE IF NOT EXISTS MyTutor;
USE MyTutor;

CREATE TABLE IF NOT EXISTS tbluser (
    usrId       VARCHAR(50)  NOT NULL PRIMARY KEY,
    usrPwd      VARCHAR(255) NOT NULL,
    usrType     VARCHAR(20)  NOT NULL,
    usrStatus   VARCHAR(20)  NOT NULL DEFAULT 'Active',
    usrName     VARCHAR(100) NOT NULL,
    usrDOB      VARCHAR(20)  DEFAULT NULL,
    usrGender   VARCHAR(10)  DEFAULT NULL,
    usrEmail    VARCHAR(100) DEFAULT NULL,
    usrAddress  VARCHAR(255) DEFAULT NULL,
    usrMobile   VARCHAR(20)  DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tblcategory (
    categoryId     INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    categoryTitle  VARCHAR(100) NOT NULL,
    categoryDesc   TEXT         DEFAULT NULL,
    categoryStatus VARCHAR(20)  NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS tbldifficultylevel (
    difficultyLevelId     INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    difficultyLevelTitle  VARCHAR(100) NOT NULL,
    difficultyLevelDesc   TEXT         DEFAULT NULL,
    difficultyLevelStatus VARCHAR(20)  NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS tbltutorial (
    tutorialId            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tutorialTitle         VARCHAR(200) NOT NULL,
    tutorialDesc          TEXT         DEFAULT NULL,
    categoryId            INT          NOT NULL,
    difficultyLevelId     INT          NOT NULL,
    tutorialPrerequisites TEXT         DEFAULT NULL,
    tutorialCreateDate    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    tutorialStatus        VARCHAR(20)  NOT NULL DEFAULT 'Active',
    usrId                 VARCHAR(50)  NOT NULL,
    FOREIGN KEY (categoryId)        REFERENCES tblcategory(categoryId),
    FOREIGN KEY (difficultyLevelId) REFERENCES tbldifficultylevel(difficultyLevelId),
    FOREIGN KEY (usrId)             REFERENCES tbluser(usrId)
);
