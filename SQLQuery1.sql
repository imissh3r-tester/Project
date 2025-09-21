IF DB_ID('HospitalDB') IS NULL
BEGIN
    CREATE DATABASE HospitalDB
    ON PRIMARY
    (
        NAME = HospitalDB_data,
        FILENAME = 'D:\SQLData\HospitalDB.mdf',
        SIZE = 20MB,
        MAXSIZE = 200MB,
        FILEGROWTH = 10MB
    )
    LOG ON
    (
        NAME = HospitalDB_log,
        FILENAME = 'E:\SQLLogs\HospitalDB.ldf',
        SIZE = 10MB,
        FILEGROWTH = 5MB
    );
END
GO

USE HospitalDB;
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'BệnhNhân')
BEGIN
    CREATE TABLE [BệnhNhân] (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        [Tên] NVARCHAR(100) NOT NULL,
        [Tuổi] INT NOT NULL,
        [GiớiTính] NVARCHAR(10) NOT NULL,
        [CMND_CCCD] NVARCHAR(20) NOT NULL,
        [SốĐiệnThoại] NVARCHAR(15) NOT NULL,
        [ĐịaChỉ] NVARCHAR(200) NOT NULL,
        [TòaNhà] NVARCHAR(10) NOT NULL,
        [Tầng] NVARCHAR(10) NOT NULL,
        [Phòng] NVARCHAR(10) NOT NULL,
        [Giường] NVARCHAR(10) NOT NULL,
        [NgàyVàoViện] DATETIME DEFAULT GETDATE(),
        [NgàyXuấtViện] DATETIME NULL,
        CONSTRAINT chk_discharge CHECK ([NgàyXuấtViện] IS NULL OR [NgàyXuấtViện] >= [NgàyVàoViện])
    );
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'Đèn')
BEGIN
    CREATE TABLE [Đèn] (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        [IDBệnhNhân] INT NULL,
        [TòaNhà] NVARCHAR(10) NOT NULL,
        [Tầng] NVARCHAR(10) NOT NULL,
        [Giường] NVARCHAR(10) NOT NULL,
        [Phòng] NVARCHAR(10) NOT NULL,
        [Trạngthái] NVARCHAR(10) NOT NULL CHECK ([Trạngthái] IN ('ON', 'OFF')),
        [Thờigian] DATETIME DEFAULT GETDATE(),
        [Ngườiquảnlý] NVARCHAR(100) NOT NULL,
        FOREIGN KEY (IDBệnhNhân) REFERENCES [BệnhNhân](Id) ON DELETE SET NULL
    );
END
GO






















