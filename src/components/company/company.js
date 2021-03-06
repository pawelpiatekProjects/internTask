import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import axios from 'axios';
import * as colors from '../../assets/colors';
import LoadingAnimation from '../loadingAnimation/loadingAnimation';
import CompanyContent from './companyContent/companyContent';
import Button from '../UIComponents/Button';

//styled components variables
const CompanyWrapper = styled.div`
width: 60%;
margin: 0 auto;
@media(max-width: 1400px){
width: 70%;
}

@media(max-width: 1000px){
width: 90%;
}
@media(max-width: 800px){
width: 100%;
}
`;

const CompanyWrapperHeading = styled.div`
width: 100%;
background-color: ${colors.primaryBlue};
padding: 2rem;
color: ${colors.white};
text-align: center;
margin-top: 2rem;
`;

const CompanyInfo = styled.div`
width: 100%;
margin: 0 auto;
`;

const CompanyWrapperHeadingItem = styled.h1`
display: inline-block;
margin: 0 3rem;

@media(max-width: 850px){
font-size: 1.8rem;
}

@media(max-width: 650px){
font-size: 1.4rem;
margin: 0 1rem;
}

@media(max-width: 500px){
font-size: 1.2rem;
}
`;

const RangeContent = styled.div`
width: 100%;
margin: 2rem auto;
text-align: center;
`;

const MinDate = styled.input`
appearance: none;
  border: 1px solid ${colors.inputColor};
  background: transparent;
  font-size: 1.5rem;
  padding: .5rem;
  margin: 0 .5rem;
  height: 3rem;
  
  @media(max-width: 350px){
display: block;
margin: 1rem auto;
}
`;

const MaxDate = styled.input`
appearance: none;
  border: 1px solid ${colors.inputColor};
  background: transparent;
  font-size: 1.5rem;
  padding: .5rem;
  margin: 0 .5rem;
  height: 3rem;
  
  @media(max-width: 350px){
display: block;
margin: 1rem auto;
}
`;

const EmptyMessage = styled.h1`
width: 100%;
margin: 5rem auto;
text-align: center;
`;

const LoadingAnimationWrapper = styled.div`
width: 50%;
margin: 5rem auto;
text-align: center;
`;
//End of styled components variables


const Company = (props) => {

    //hooks used to manage state in this component
    const [incomes, setIncomes] = useState([]); //array with incomes
    const [incomeSum, setIncomeSum] = useState(0); //total income
    const [lastMonthIncome, setLastMonthIncome] = useState(0); // last month income
    const [minDate, setMinDate] = useState(null); //date from we start calculating and displaying incomes
    const [maxDate, setMaxDate] = useState(null);//date from we end calculating and displaying incomes
    const [showIncomes, setShowIncomes] = useState(false); // whether incomes list should be displayed
    const [canDisplayIncome, setCanDisplayIncome] = useState(true); // whether incomes list is empty
    const [isLoading, setIsLoading] = useState(false);

    //splitting info from companiesList component (which contains concatenated id, name, and city of selected company)
    //into an array
    const info = props.location.state.info.split(".");

    //hook used to fetch data
    useEffect(() => {
        setIsLoading(true);
        axios.get(`https://recruitment.hal.skygate.io/incomes/${info[0]}`)
            .then(response => {
                //sorting incomes array by date
                const sortedIncomes = response.data.incomes.sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
                setIncomes(sortedIncomes)
                return sortedIncomes;
            })
            .then(response => {
                let sum = 0;
                //summing value of total income
                response.map(el => (
                    sum += parseFloat(el.value)
                ))
                setIncomeSum(sum)
                return response;
            })
            .then(array => {
                //calculating last month income
                let lastMonthIncome = 0;
                const lastIncomeDate = array[array.length - 1].date.slice(0, 7);
                array.filter(month => (
                    month.date.slice(0, 7).toString() === lastIncomeDate
                ))
                    .map(el => (
                        lastMonthIncome += parseFloat(el.value)
                    ))
                setLastMonthIncome(lastMonthIncome)
                setIsLoading(false);
            })
    }, []);

    //calculating average income
    const averageIncome = incomeSum / incomes.length;

    //filtering array by the selected time period and recalculating total and average income
    const setRange = () => {
        let sum = 0;
        const rangedIncomes = incomes.filter(income => {
            if (Date.parse(income.date) >= Date.parse(minDate) && Date.parse(income.date) <= Date.parse(maxDate)) {
                sum += parseFloat(income.value);
                return income;
            }
        })
        if (rangedIncomes.length > 0) {
            setCanDisplayIncome(true);
            setIncomeSum(sum);
            setIncomes(rangedIncomes);
            const lastMonthIncomeDate = rangedIncomes[rangedIncomes.length - 1].date.slice(0, 7);
            let lastMonthIncome = 0;
            rangedIncomes.filter(month => (
                month.date.slice(0, 7).toString() === lastMonthIncomeDate
            ))
                .map(el => (
                    lastMonthIncome += parseFloat(el.value)
                ))
            setLastMonthIncome(lastMonthIncome);
        } else {
            setCanDisplayIncome(false);
        }

    };

    // When the incomes array is empty the EmptyMessage is displayed instead of CompanyContent component
    const incomesList = (
        canDisplayIncome ?
            (
                <CompanyContent
                    incomeSum={incomeSum}
                    averageIncome={averageIncome}
                    lastMonthIncome={lastMonthIncome}
                    setShowIncomes={setShowIncomes}
                    showIncomes={showIncomes}
                    incomes={incomes}
                />
            )
            : <EmptyMessage>There is no income during this period</EmptyMessage>
    );

    //All information about company and inputs which are used to set time period
    const companyInfo = (
        <CompanyInfo>
            <RangeContent>
                <MinDate type="date" onChange={e => setMinDate(e.target.value)}/>
                <MaxDate type="date" onChange={e => setMaxDate(e.target.value)}/>

                <Button
                    isBlue={true}
                    disabled={
                        (maxDate === null || minDate === null)
                        || (maxDate === null && minDate === null) ? true : false
                    }
                    text="Set range"
                    click={setRange}
                />
            </RangeContent>
            {incomesList}
        </CompanyInfo>
    );

    return (
        <CompanyWrapper>
            <Button
                text="Back to list"
                isBlue={true}
                click={() => props.history.push('/')}/>
            <CompanyWrapperHeading>
                <CompanyWrapperHeadingItem>{info[0]}</CompanyWrapperHeadingItem>
                <CompanyWrapperHeadingItem>{info[1]}</CompanyWrapperHeadingItem>
                <CompanyWrapperHeadingItem>{info[2]}</CompanyWrapperHeadingItem>
            </CompanyWrapperHeading>
            {
                // Loading animation is being displayed when data from server haven't been yet fetched
                isLoading ? (
                    <LoadingAnimationWrapper>
                        <LoadingAnimation isBig/>
                    </LoadingAnimationWrapper>
                ) : companyInfo
            }
        </CompanyWrapper>
    )
};

export default Company;
