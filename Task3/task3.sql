IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'GasStationsManagement')
BEGIN
    CREATE DATABASE GasStationsManagement
    PRINT 'Created database GasStationsManagement successfully'
END
ELSE 
    PRINT 'Database GasStationsManagement already exists'
GO

USE GasStationsManagement
GO

IF NOT EXISTS (SELECT name FROM sys.tables WHERE name = 'GasStations')
BEGIN
    CREATE TABLE GasStations(
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        address NVARCHAR(200) NOT NULL,
        phoneNumber VARCHAR(20) NOT NULL,
        status BIT DEFAULT 1,
        createdDate DATETIME DEFAULT GETDATE(),
        updatedDate DATETIME DEFAULT GETDATE(),
    )
    PRINT 'Created table GasStations successfully'
END
ELSE 
    PRINT 'Table GasStations already exists'

IF NOT EXISTS (SELECT name FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products(
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        amount DECIMAL(18,2) NOT NULL,
        price DECIMAL(18,2) NOT NULL,
        status BIT DEFAULT 1,
        description VARCHAR(200) NOT NULL,
        createdDate DATETIME DEFAULT GETDATE(),
        updatedDate DATETIME DEFAULT GETDATE(),
    )
    PRINT 'Created table Products successfully'
END
ELSE 
    PRINT 'Table Products already exists'

IF NOT EXISTS (SELECT name FROM sys.tables WHERE name = 'GasPumps')
BEGIN
    CREATE TABLE GasPumps(
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        gasStationId INT NOT NULL,
        productId INT NOT NULL,
        status BIT DEFAULT 1,
        createdDate DATETIME DEFAULT GETDATE(),
        updatedDate DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (gasStationId) REFERENCES GasStations(id),
        FOREIGN KEY (productId) REFERENCES Products(id),
    )
    PRINT 'Created table GasPumps successfully'
END
ELSE 
    PRINT 'Table GasPumps already exists'

IF NOT EXISTS (SELECT name FROM sys.tables WHERE name = 'Transactions')
BEGIN
    CREATE TABLE Transactions(
        id INT IDENTITY(1,1) PRIMARY KEY,
        transactionCode VARCHAR(20) NOT NULL UNIQUE,
        transactionDate DATETIME NOT NULL,
        gasPumpId INT NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        price DECIMAL(18,2) NOT NULL,
        total DECIMAL(18,2) NOT NULL,
        paymentMethod NVARCHAR(100) NOT NULL,
        note NVARCHAR(100) NOT NULL,
        createdDate DATETIME NOT NULL,
        updatedDate DATETIME,
        FOREIGN KEY (gasPumpId) REFERENCES GasPumps(id),
    )
    PRINT 'Created table Transactions successfully'
END
ELSE 
    PRINT 'Table GasPump Transactions exists'

