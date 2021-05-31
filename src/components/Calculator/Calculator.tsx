import React, {useMemo, useRef, useState} from 'react';
import {makeStyles, createStyles} from '@material-ui/core/styles';
import {Grid, TextField, Button} from '@material-ui/core';
import {useRifm} from 'rifm';
import {appendDot, formatDateWithAppend, strToDigitArray, sumIntArray} from "../../utils/CalcHelper";
import cn from 'classnames';


const useStyles = makeStyles(() => createStyles({
  smallContent: {
    fontFamily: '"Nunito", sans-serif',
    padding: 5,
    overflow: 'hidden',
    fontSize: 12,
  },
  content: {
    fontFamily: '"Nunito", sans-serif',
    fontSize: 14,
    overflow: 'hidden'
  },
  pageTitle: {
    textAlign: "center"
  },
  button: {
    background: '#cecec6',
  },
  primary: {
    background: '#e5ded3',

    '&:disabled': {
      opacity: 0.5
    }
  },
  secondary: {
    background: '#fbf8f2',
  },
  table: {
    marginTop: 30,
    marginBottom: 30,
    fontSize: 18,
    width: '100%',
    '& td': {
      textAlign: 'center',
      border: '1px solid black',
      width: '25%',
      paddingBottom: '5%',
      paddingTop: '5%',
      paddingLeft: 10,
      paddingRight: 10,
    },
  },
  smallTable: {
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
    fontSize: 10,

    '& td': {
      width: '25%',
      padding: 5,
      paddingBottom: 15,
      paddingTop: 15,
      textAlign: 'center',
      border: '1px solid black',
    }
  },
  disableAlign: {
    // @ts-ignore
    textAlign: 'left !important',
    paddingLeft: '15px !important',
  },
  footer: {
    marginTop: 30,
    marginBottom: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,

    '& a': {
      color: '#6f97ff',
      textDecoration: 'none',

      '&:hover': {
        color: '#6080ff'
      }
    }
  },
  note: {
    fontSize: '0.8em',
    marginTop: 5,
  }

}));

enum ADIGIT {
  FIRST,
  SECOND,
  THIRD,
  FOURTH
}

enum MAGIC {
  NULL,
  CHARACTER,
  ENERGY,
  INTEREST,
  HEALTH,
  LOGIC,
  LABOR,
  LUCK,
  DUTY,
  MEMORY
}

type AdditionalDigitsType = {
  [key in ADIGIT]: number;
};

const defaultAdditionalDigits: AdditionalDigitsType = {
  [ADIGIT.FIRST]: 0,
  [ADIGIT.SECOND]: 0,
  [ADIGIT.THIRD]: 0,
  [ADIGIT.FOURTH]: 0,
};

export function Calculator() {
  const [dateValue, setDateValue] = useState<string>('');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [additionalDigits, setAdditionalDigits] = useState<AdditionalDigitsType>(defaultAdditionalDigits);
  const textAreaRef = useRef(null);

  const isSmallScreen = useMemo(() => document.documentElement.clientWidth < 960, []);

  // Лень использовать билдер
  const additionalNumString = useMemo(
    () => `${strToDigitArray(dateValue)}${additionalDigits[ADIGIT.FIRST]}${additionalDigits[ADIGIT.SECOND]}${additionalDigits[ADIGIT.THIRD]}${additionalDigits[ADIGIT.FOURTH]}`,
    [additionalDigits]
  );

  const outBaseNum = (num: number): string => {
    if (!isCalculated) {
      return '-';
    }

    const length = calcBaseNum(num);

    return length ? num.toString().repeat(length) : '-';
  };

  const outComplexNum = (num: number): string => {
    if (!isCalculated) {
      return '-';
    }

    return num.toString();
  };

  const calcBaseNum = (num: number): number => {
    return additionalNumString.split(num.toString()).length - 1;
  };

  const classes = useStyles();

  const onChange = (newValue: string) => {
    setIsCalculated(false);
    setDateValue(newValue);
  };

  const rifm = useRifm({
    value: dateValue,
    onChange,
    format: formatDateWithAppend,
    append: appendDot
  });

  const calculatePersonality = (): void => {
    const digits = strToDigitArray(dateValue);

    setAdditionalDigits(calculateAdditionalDigits(digits));

    setIsCalculated(true);
  };

  const calculateFate = (): string => {
    if (!isCalculated) {
      return '';
    }

    let num = sumIntArray(strToDigitArray(dateValue));

    while (num > 9 && num !== 11) {
      num = sumIntArray(strToDigitArray(num.toString()))
    }

    return num.toString();
  };

  const calculateAdditionalDigits = (digits: number[]): AdditionalDigitsType => {
    const additional1 = sumIntArray(digits);
    const additional2 = sumIntArray(strToDigitArray(additional1.toString()));
    const additional3 = additional1 - (2 * (digits[0] || digits[1]));
    const additional4 = sumIntArray(strToDigitArray(additional3.toString()));

    return {
      [ADIGIT.FIRST]: additional1,
      [ADIGIT.SECOND]: additional2,
      [ADIGIT.THIRD]: additional3,
      [ADIGIT.FOURTH]: additional4,
    }
  };

  const calculateSummary = (): string => {
    if (!isCalculated) {
      return '-';
    }

    return `${outBaseNum(MAGIC.CHARACTER)}`
    + `/${outBaseNum(MAGIC.ENERGY)}`
    + `/${outBaseNum(MAGIC.INTEREST)}`
    + `/${outBaseNum(MAGIC.HEALTH)}`
    + `/${outBaseNum(MAGIC.LOGIC)}`
    + `/${outBaseNum(MAGIC.LABOR)}`
    + `/${outBaseNum(MAGIC.LUCK)}`
    + `/${outBaseNum(MAGIC.DUTY)}`
    + `/${outBaseNum(MAGIC.MEMORY)}`
    + `/п${outComplexNum(calcBaseNum(MAGIC.INTEREST) + calcBaseNum(MAGIC.LOGIC) + calcBaseNum(MAGIC.LUCK))}`
    + `/ц${outComplexNum(calcBaseNum(MAGIC.CHARACTER) + calcBaseNum(MAGIC.HEALTH) + calcBaseNum(MAGIC.LUCK))}`
    + `/с${outComplexNum(calcBaseNum(MAGIC.ENERGY) + calcBaseNum(MAGIC.LOGIC) + calcBaseNum(MAGIC.DUTY))}`
    + `/д${outComplexNum(calcBaseNum(MAGIC.HEALTH) + calcBaseNum(MAGIC.LOGIC) + calcBaseNum(MAGIC.LABOR))}`
    + `/чжп${calculateFate()}`
  };

  const outputValue = (value: any) => (isCalculated ? value : '');

  const copyResult = () => {
    if (textAreaRef !== null) {
      // @ts-ignore
      textAreaRef.current.select();
      document.execCommand('copy');
    }
  };

  return (<Grid container alignContent="center" className={classes.content}>
    <Grid direction="row" justify="center" item xs={12} alignItems="center">
      <h1 className={classes.pageTitle}>Матрица личности</h1>
    </Grid>
    <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
      <Grid item>
        <TextField
          placeholder="ЧЧ.ММ.ГГГГ"
          value={rifm.value}
          onChange={rifm.onChange}
        />
      </Grid>
      <Grid item>
        <Button
          onClick={calculatePersonality}
          disabled={dateValue.length < 10}
          className={classes.button}
          size="large"
        >
          Рассчитать
        </Button>
      </Grid>
    </Grid>
    <Grid container direction="row" justify="center" alignItems="center">
      <Grid item xs={12} md={5}>

        <div>
          <div>
            <table className={
              cn({
                [classes.table]: !isSmallScreen,
                [classes.smallTable]: isSmallScreen
              })
            }>
              <thead>
              <tr>
                <td colSpan={3} className={`${classes.primary} ${classes.disableAlign}`}>
                  <div>
                    <span>Дата рождения: </span>
                    {outputValue(dateValue)}</div>
                  <div>
                    <span>Дополнительные числа: </span>
                    {outputValue(additionalDigits[ADIGIT.FIRST] + ', ')}
                    {outputValue(additionalDigits[ADIGIT.SECOND] + ', ')}
                    {outputValue(additionalDigits[ADIGIT.THIRD] + ', ')}
                    {outputValue(additionalDigits[ADIGIT.FOURTH])}
                  </div>
                  <div>
                    <span>Число жизненного пути: </span>
                    {calculateFate()}
                  </div>
                </td>
                <td className={classes.primary}>
                  <div>Плотское</div>
                  {outComplexNum(calcBaseNum(MAGIC.INTEREST) + calcBaseNum(MAGIC.LOGIC) + calcBaseNum(MAGIC.LUCK))}
                </td>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td className={classes.secondary}>
                  <div>Характер</div>
                  {outBaseNum(MAGIC.CHARACTER)}
                </td>
                <td className={classes.secondary}>
                  <div>Здоровье</div>
                  {outBaseNum(MAGIC.HEALTH)}
                </td>
                <td className={classes.secondary}>
                  <div>Удача</div>
                  {outBaseNum(MAGIC.LUCK)}
                </td>
                <td className={classes.primary}>
                  <div>Цель</div>
                  {outComplexNum(calcBaseNum(MAGIC.CHARACTER) + calcBaseNum(MAGIC.HEALTH) + calcBaseNum(MAGIC.LUCK))}
                </td>
              </tr>
              <tr>
                <td className={classes.secondary}>
                  <div>Энергия</div>
                  {outBaseNum(MAGIC.ENERGY)}
                </td>
                <td className={classes.secondary}>
                  <div>Логика</div>
                  {outBaseNum(MAGIC.LOGIC)}
                </td>
                <td className={classes.secondary}>
                  <div>Долг</div>
                  {outBaseNum(MAGIC.DUTY)}
                </td>
                <td className={classes.primary}>
                  <div>Семья</div>
                  {outComplexNum(calcBaseNum(MAGIC.ENERGY) + calcBaseNum(MAGIC.LOGIC) + calcBaseNum(MAGIC.DUTY))}
                </td>
              </tr>
              <tr>
                <td className={classes.secondary}>
                  <div>Интерес</div>
                  {outBaseNum(MAGIC.INTEREST)}
                </td>
                <td className={classes.secondary}>
                  <div>Труд</div>
                  {outBaseNum(MAGIC.LABOR)}
                </td>
                <td className={classes.secondary}>
                  <div>Память</div>
                  {outBaseNum(MAGIC.MEMORY)}
                </td>
                <td className={classes.primary}>
                  <div>Привычки</div>
                  {outComplexNum(calcBaseNum(MAGIC.INTEREST) + calcBaseNum(MAGIC.LABOR) + calcBaseNum(MAGIC.MEMORY))}
                </td>
              </tr>
              <tr>
                <td className={classes.secondary}>
                </td>
                <td className={classes.secondary}>
                  <div>Деньги</div>
                  {outComplexNum(calcBaseNum(MAGIC.HEALTH) + calcBaseNum(MAGIC.LOGIC) + calcBaseNum(MAGIC.LABOR))}
                </td>
                <td className={classes.secondary}>
                  <div>Талант</div>
                  {outComplexNum(calcBaseNum(MAGIC.LUCK) + calcBaseNum(MAGIC.DUTY) + calcBaseNum(MAGIC.MEMORY))}
                </td>
                <td className={classes.primary}>
                  <div>Духовное</div>
                  {outComplexNum(calcBaseNum(MAGIC.CHARACTER) + calcBaseNum(MAGIC.LOGIC) + calcBaseNum(MAGIC.MEMORY))}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Grid item container xs={12}>
          <Grid item xs={12} md={6}>
            <TextField
              inputRef={textAreaRef}
              value={calculateSummary()}
              multiline
              fullWidth
              disabled={!isCalculated}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              className={classes.button}
              disabled={!isCalculated}
              onClick={copyResult}
            >
              Скопировать
            </Button>
          </Grid>
          <Grid item xs={12}>
            <div className={classes.note}>
              *скопируйте эту строку и вставьте в комментарии под последним постом вместе со своим вопросом
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className={classes.footer}>
              <a rel="noreferrer" href="https://www.instagram.com/numerolog__pro/" target="_blank">@numerolog__pro</a>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Grid>);
}
