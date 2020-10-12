import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface BalanceResponse {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionResponse {
  id: string;
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_id: string;
  created_at: Date;
  update_at: Date;
  category: {
    id: string;
    title: string;
    created_at: Date;
    update_at: Date;
  }
}

interface ResponseData {
  transactions: TransactionResponse[],
  balance: BalanceResponse
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get<ResponseData>('transactions');

      if (response.status === 200) {
        const transactionsFormatted: Transaction[] = response.data.transactions.map(transaction => ({
          id: transaction.id,
          title: transaction.title,
          value: transaction.value,
          formattedValue: formatValue(transaction.value),
          formattedDate: new Date(transaction.created_at).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          type: transaction.type,
          category: { title: transaction.category.title },
          created_at: new Date(transaction.created_at)
        }));

        const balanceResponse: BalanceResponse = response.data.balance;
        const balanceObj = {
          income: formatValue(balanceResponse.income),
          outcome: formatValue(balanceResponse.outcome),
          total: formatValue(balanceResponse.total),
        };

        setTransactions(transactionsFormatted);
        setBalance(balanceObj);
        console.log(balanceObj);
      }
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">- {balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {
                transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="title">{transaction.title}</td>
                    <td className={transaction.type}>{transaction.formattedValue}</td>
                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
