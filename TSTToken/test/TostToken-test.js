const { expect } = require("chai");
const hre = require("hardhat");

describe("Testy TostToken:", function() {
  let name = "TostToken";
  let symbol = "TST";
  let decimals = 18;
  let Token;
  let tostToken;
  let owner;
  let user1;
  let user2;
  let tokenCap = 1000000;
  let tokenBlockReward = 10;

  //Utworzenie contractFactory oraz kont na potrzeby testow
  beforeEach(async function () {
    Token = await ethers.getContractFactory("TostToken");
    [owner, user1, user2] = await hre.ethers.getSigners();

    tostToken = await Token.deploy(tokenCap, tokenBlockReward);
  });
  
  describe("Atrybuty tokenu", function () {
    it("Nazwa tokenu zostala ustawiona poprawnie", async function () {
      expect(await tostToken.name()).to.equal(name);
    })

    it("Symbol tokenu zostal ustawiony poprawnie", async function () {
      expect(await tostToken.symbol()).to.equal(symbol);
    })

    it("Podzielnosc tokenu zostala ustawiona poprawnie", async function () {
      expect(await tostToken.decimals()).to.equal(decimals);
    })

    it("Wlasciciel tokenu zostal ustawiony poprawnie", async function () {
      expect(await tostToken.owner()).to.equal(owner.address);
    });

    it("Wlascicielowi zostala przydzielona zadana ilosc tokenow", async function () {
      const ownerBalance = await tostToken.balanceOf(owner.address);
      expect(await tostToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Maksymalny limit tokenu zostal ustawiony poprawnie", async function () {
      const cap = await tostToken.cap();
      expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
    });

    it("BlockReward zostal ustawiony poprawnie", async function () {
      const blockReward = await tostToken.blockReward();
      expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
    });
  });

  describe("Transakcje", function () {
    it("Transfer miedzy adresami zostal wykonany poprawnie", async function () {
      // Proba wyslania 100 tokenow z konta wlasicicela na adres user1
      await tostToken.transfer(user1.address, 100);
      const user1Balance = await tostToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(100);

      // Proba wyslania 50 tokenow z user1 do user2
      await tostToken.connect(user1).transfer(user2.address, 70);
      const user2Balance = await tostToken.balanceOf(user2.address);
      expect(user2Balance).to.equal(70);
    });

    it("Zabezpieczenie przed wysłaniem nieposiadanych tokenow dziala poprawnie", async function () {
      const startOwnerBalance = await tostToken.balanceOf(owner.address);// 1000000 tokenow
      const startUser1Balance = await tostToken.balanceOf(user1.address);// 0 tokenow
      // Proba wysłania 10 tokenow z konta user1 na konto wlasciciela.
      // Powinien zostac wygenerowany komunikat o bledzie
      await expect(
        tostToken.connect(user1).transfer(owner.address, 10)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Saldo konta wlasciciela nie powinno ulec zmianie
      expect(await tostToken.balanceOf(owner.address)).to.equal(startOwnerBalance);
      
      // Saldo konta user1 nie powinno ulec zmianie
      expect(await tostToken.balanceOf(user1.address)).to.equal(startUser1Balance);
    });

    it("Aktualizacja salda po wykonaiu transferu zostala wykonana poprawnie", async function () {
      const startOwnerBalance = await tostToken.balanceOf(owner.address);

      // Proba wyslania 1000 tokenow z konta wlascicieciela do user1
      await tostToken.transfer(user1.address, 1000);

      // Proba wyslania 100 tokenow z konta user1 do user2
      await tostToken.connect(user1).transfer(user2.address, 100);

      // Sprawdzenie salda na koncie wlasciciela
      const finalOwnerBalance = await tostToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(startOwnerBalance.sub(1000));
      
      // Sprawdzenie salda na koncie user1
      const user1Balance = await tostToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(900);

      // Sprawdzenie salda na koncie user2
      const user2Balance = await tostToken.balanceOf(user2.address);
      expect(user2Balance).to.equal(100);
    });
  });
  
});