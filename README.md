# Lannister Bank Token Sale - Whitelist-Gated Token Sale

## Introduction

Welcome to the Lannister Bank Token Sale, a secure and exclusive platform where tokens are traded under the vigilant eyes of the Lannisters. This program is designed to allow only whitelisted users to participate in the token sale, ensuring a privileged and fair distribution.

## Features

-   **Whitelist-Gated Access:** Only pre-approved addresses on the whitelist can buy tokens.
-   **Static Token Price:** The cost per token is fixed throughout the sale to maintain simplicity and transparency.
-   **Purchase Limits:** Set limits on the number of tokens each participant can buy to promote equitable distribution among all whitelisted addresses.

## Scope of Work

- **Develop a Whitelist-Gated Sale Program:** Utilizing Native Rust or Anchor, implement a program to manage a token sale where only whitelisted users can participate. ✅
- **Static Token Pricing:** Ensure the price per token does not change throughout the sale. ✅
- **Purchase Limits:** Implement a cap on the number of tokens each wallet can purchase to ensure a fair distribution of tokens. ✅
- **Optional:** Develop a blink (visual or interactive demo) to showcase the functionality of the program. 🔜

## Getting Started

To engage with the Lannister Bank Token Sale, follow the steps below to set up and test the program.

### Prerequisites

-   **Install Anchor:** Ensure that you have Anchor CLI installed. Use version `0.29.0` for optimal compatibility with our scripts:
    ```bash
    avm install 0.29.0
    avm use 0.29.0
    ```

### Running the Tests

Execute the following commands to build the program and run the tests, ensuring everything is set up correctly:

```bash
yarn install
anchor build
anchor test
```
