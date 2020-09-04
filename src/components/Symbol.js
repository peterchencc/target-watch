import React from 'react'

const PercentageChange = (props) => {
  let decreaseValue = props.oldNumber - props.newNumber
  let percentage = ((decreaseValue / props.oldNumber) * 100).toFixed(2)

  return (
    <span className={percentage > 0 ? 'text-green-600' : 'text-red-600'}>
      {percentage > 0 && '+'}
      {percentage}%
    </span>
  )
}

const PriceChange = (props) => {
  let decreaseValue =
    Math.round((props.newNumber - props.oldNumber) * 100) / 100

  return (
    <span className={decreaseValue > 0 ? 'text-green-600' : 'text-red-600'}>
      {decreaseValue > 0 && '+'}
      {decreaseValue}
    </span>
  )
}

const Symbol = (props) => {
  const refetchData = () => {
    props.getSymbol(props.name)
  }

  if (!props.data) {
    return (
      <div
        className="rounded border border-gray-500 bg-white float-left"
        onClick={refetchData}
      >
        <div className="px-4 py-4">
          <div className="text-base mb-2">
            {props.name}
            <div className="flex items-center">
              <div className="text-lg font-bold mr-3">----</div>
              <div className="font-light tracking-tight">----</div>
            </div>
          </div>
          <div className="text-base">
            <div className="text-sm text-gray-600 uppercase">Target Price</div>
            <div>
              <div className="text-lg inline-block align-top">
                <div>------</div>
                <div className="text-sm font-light tracking-tight leading-tight">
                  ------
                </div>
              </div>
              <div className="text-lg inline-block align-top mx-2">－</div>
              <div className="text-lg inline-block align-top">
                <div>-----</div>
                <div className="text-sm font-light tracking-tight leading-tight">
                  ---------
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const {
    name,
    currentPrice,
    previousClose,
    lowestTarget,
    highestTarget,
    targetsDuration,
    recentTargets,
  } = props.data

  let ratingLink = 'https://www.benzinga.com/stock/' + name + '/ratings'

  return (
    <div
      className="rounded border border-gray-500 bg-white float-left m-2"
      onClick={refetchData}
    >
      <div className="px-4 py-4">
        <div className="text-base mb-2">
          {name}
          <div className="flex items-center">
            <div className="text-lg font-bold mr-3">
              {currentPrice ? currentPrice : '-'}
            </div>
            <div className="font-light tracking-tight">
              <PriceChange newNumber={currentPrice} oldNumber={previousClose} />{' '}
              (
              <PercentageChange
                newNumber={previousClose}
                oldNumber={currentPrice}
              />
              )
            </div>
          </div>
        </div>
        <div className="text-base">
          <div className="text-sm text-gray-600 uppercase">Target Price</div>
          <div>
            <div className="text-lg inline-block align-top">
              <div>{lowestTarget}</div>
              <div className="text-sm font-light tracking-tight leading-tight">
                <PercentageChange
                  oldNumber={lowestTarget}
                  newNumber={currentPrice}
                />
              </div>
            </div>
            <div className="text-lg inline-block align-top mx-2">－</div>
            <div className="text-lg inline-block align-top">
              <div>{highestTarget}</div>
              <div className="text-sm font-light tracking-tight leading-tight">
                <PercentageChange
                  oldNumber={highestTarget}
                  newNumber={currentPrice}
                />
              </div>
            </div>
          </div>

          {recentTargets && recentTargets.length > 0 && (
            <div className=" lowercase mt-2 text-xs font-light tracking-tighter">
              based on {recentTargets.length}{' '}
              <a
                className="hover:text-blue-700"
                href={ratingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                ratings
              </a>{' '}
              in past {targetsDuration + ' days'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Symbol
